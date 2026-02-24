import type { AxiosInstance } from 'axios'
import { ref } from 'vue'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import type { NewProductInventory, ProductInventory } from '@/schemas/productInventory'

export function useProductInventory() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const productInventories = ref<ProductInventory[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function withLoading(fn: () => Promise<void>) {
    loading.value = true
    try {
      await fn()
    }
    catch (error: any) {
      showToast({
        title: 'Error',
        text: error?.message ?? 'Something went wrong',
        color: 'error',
        icon: '$error',
      })
    }
    finally {
      loading.value = false
    }
  }

  async function fetchAllProductInventory(options?: { page?: number; perPage?: number }) {
    await withLoading(async () => {
      // FIX: Correctly update state based on options
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('product-inventory', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      // Defensive Parsing to prevent "Cannot read properties of undefined (reading 'total')"
      let rows: ProductInventory[] = []
      let pageInfo = { total: 0, currentPage: 1, lastPage: 1 }

      if (payload?.data) {
        if (Array.isArray(payload.data)) {
          // Format: [ [rows], {pagination} ]
          rows = payload.data[0] || []
          pageInfo = payload.data[1] || pageInfo
        }
        else {
          // Format: { rows: [], pagination: {} }
          rows = payload.data.rows || []
          pageInfo = payload.data.pagination || pageInfo
        }
      }

      productInventories.value = rows
      pagination.value = {
        total: pageInfo?.total ?? 0,
        perPage: pagination.value.perPage,
        currentPage: pageInfo?.currentPage ?? 1,
        lastPage: pageInfo?.lastPage ?? 1,
      }
    })
  }

  async function fetchAllActiveProductInventory() {
    const { data } = await $api.get('product-inventory/active')
    const result = Array.isArray(data) ? data : (data?.data || [])

    productInventories.value = result

    return result
  }

  const openAdd = ref(false)

  const newProductInventory = ref<NewProductInventory>({
    product_uuid: '', supplier_uuid: '', serial_number: '', source_type: '', status: '',
  })

  function addProductInventory() {
    newProductInventory.value = {
      product_uuid: '', supplier_uuid: '', serial_number: '', source_type: '', status: '',
    }
    openAdd.value = true
  }

  async function createProductInventory() {
    await withLoading(async () => {
      const { data } = await $api.post('product-inventory/create', newProductInventory.value)

      showToast({ title: 'Success', text: data.message, color: 'success', icon: '$success' })
      await fetchAllProductInventory()
      openAdd.value = false
    })
  }

  const openEdit = ref(false)
  const productInventoryToEdit = ref<ProductInventory | null>(null)

  function editProductInventory(productInventory: ProductInventory) {
    productInventoryToEdit.value = { ...productInventory }
    openEdit.value = true
  }

  async function updateProductInventory(productInventory: ProductInventory) {
    await withLoading(async () => {
      const { data } = await $api.put('product-inventory/updateStatus', productInventory)

      showToast({ title: 'Success', text: data.message, color: 'success', icon: '$success' })
      await fetchAllProductInventory()
      openEdit.value = false
    })
  }

  const openDelete = ref(false)
  const productInventoryToDelete = ref<ProductInventory | null>(null)

  function deleteProductInventoryModal(productInventory: ProductInventory) {
    productInventoryToDelete.value = { ...productInventory }
    openDelete.value = true
  }

  async function deleteProductInventory(productInventory: ProductInventory) {
    await withLoading(async () => {
      const { data } = await $api.put('product-inventory/delete', {
        inventory_uuid: productInventory.inventory_uuid,
      })

      showToast({ title: 'Deleted', text: data.message, color: 'success', icon: '$success' })
      await fetchAllProductInventory()
      openDelete.value = false
    })
  }

  async function restoreProductInventory(productInventory: ProductInventory) {
    await withLoading(async () => {
      const { data } = await $api.put('product-inventory/restore', {
        inventory_uuid: productInventory.inventory_uuid,
      })

      showToast({ title: 'Restored', text: data.message, color: 'success', icon: '$success' })
      await fetchAllProductInventory()
    })
  }

  async function importProductInventoryCsv(file: File) {
    await withLoading(async () => {
      const formData = new FormData()

      formData.append('file', file) // Ensure this key matches what PHP expects (e.g., 'file')

      // REMOVE the manual Content-Type header
      const { data } = await $api.post('product-inventory/importProductInventory', formData)

      showToast({
        title: 'Import Successful',
        text: data.message || 'Inventory items have been imported.',
        color: 'success',
        icon: '$success',
      })

      await fetchAllProductInventory()
    })
  }

  return {
    loading,
    showToast,
    productInventories,
    fetchAllProductInventory,
    pagination,
    openAdd,
    newProductInventory,
    addProductInventory,
    createProductInventory,
    editProductInventory,
    openEdit,
    productInventoryToEdit,
    updateProductInventory,
    deleteProductInventory,
    deleteProductInventoryModal,
    openDelete,
    productInventoryToDelete,
    restoreProductInventory,
    importProductInventoryCsv,
    fetchAllActiveProductInventory,
  }
}
