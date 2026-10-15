import { ref } from 'vue'
import type { ApiClient } from '@/types/api'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import type { NewProductInventory, ProductInventory } from '@/schemas/productInventory'
import { parsePage, withLoading } from '@/utils/requests'

export function useProductInventory() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const productInventories = ref<ProductInventory[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  // search: serial number, product name, model or brand; status: 'all' or a unit status
  const filters = ref({ search: '', status: 'all' })

  async function fetchAllProductInventory(options?: { page?: number; perPage?: number }) {
    await withLoading(loading, async () => {
      // FIX: Correctly update state based on options
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('product-inventory', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
          search: filters.value.search || undefined,
          status: filters.value.status === 'all' ? undefined : filters.value.status,
        },
      })

      const page = parsePage(data, pagination.value.perPage)

      productInventories.value = page.rows
      pagination.value = page.pagination
    })
  }

  async function fetchAllActiveProductInventory() {
    const { data } = await $api.get('product-inventory/active')
    const result = data?.data || []

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
    await withLoading(loading, async () => {
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
    await withLoading(loading, async () => {
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
    await withLoading(loading, async () => {
      const { data } = await $api.put('product-inventory/delete', {
        inventory_uuid: productInventory.inventory_uuid,
      })

      showToast({ title: 'Deleted', text: data.message, color: 'success', icon: '$success' })
      await fetchAllProductInventory()
      openDelete.value = false
    })
  }

  async function restoreProductInventory(productInventory: ProductInventory) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('product-inventory/restore', {
        inventory_uuid: productInventory.inventory_uuid,
      })

      showToast({ title: 'Restored', text: data.message, color: 'success', icon: '$success' })
      await fetchAllProductInventory()
    })
  }

  // Returns whether it was imported, so a refused file keeps its dialog open.
  async function importProductInventoryCsv(file: File): Promise<boolean> {
    let imported = false

    await withLoading(loading, async () => {
      const formData = new FormData()

      formData.append('file', file) // Ensure this key matches what PHP expects (e.g., 'file')

      // REMOVE the manual Content-Type header
      const { data } = await $api.post('product-inventory/importProductInventory', formData)

      imported = true
      showToast({
        title: 'Import Successful',
        text: data.message || 'Inventory items have been imported.',
        color: 'success',
        icon: '$success',
      })

      await fetchAllProductInventory()
    })

    return imported
  }

  return {
    loading,
    showToast,
    productInventories,
    filters,
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
