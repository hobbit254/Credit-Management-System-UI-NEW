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
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.currentPage = options.perPage

      const { data } = await $api.get('product-inventory', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      productInventories.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    })
  }

  const openAdd = ref(false)

  const newProductInventory = ref<NewProductInventory>({
    product_uuid: '',
    supplier_uuid: '',
    serial_number: '',
    source_type: '',
    status: '',
  })

  function addProductInventory() {
    newProductInventory.value = {
      product_uuid: '',
      supplier_uuid: '',
      serial_number: '',
      source_type: '',
      status: '',
    }
    openAdd.value = true
  }

  async function createProductInventory() {
    await withLoading(async () => {
      const { data } = await $api.post('product-inventory/create', newProductInventory.value)

      showToast({
        title: 'Create New Product Inventory',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
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

      showToast({
        title: 'Update Product Inventory',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
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

      showToast({
        title: 'Delete Product Inventory',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProductInventory()
      openDelete.value = false
    })
  }

  async function restoreProductInventory(productInventory: ProductInventory) {
    await withLoading(async () => {
      const { data } = await $api.put('product-inventory/restore', {
        inventory_uuid: productInventory.inventory_uuid,
      })

      showToast({
        title: 'Restore Product Inventory',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProductInventory()
    })
  }

  async function activateProductInventory(productInventory: ProductInventory) {
    await withLoading(async () => {
      const { data } = await $api.put('product-inventory/updateStatusActive', {
        inventory_uuid: productInventory.inventory_uuid,
        active: 1,
      })

      showToast({
        title: 'Activate Product Inventory',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProductInventory()
    })
  }

  async function deactivateProductInventory(productInventory: ProductInventory) {
    await withLoading(async () => {
      const { data } = await $api.put('product-inventory/updateStatusActive', {
        inventory_uuid: productInventory.inventory_uuid,
        active: 0,
      })

      showToast({
        title: 'Deactivate Product Inventory',
        text: data.message,
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
    activateProductInventory,
    deactivateProductInventory,
  }
}
