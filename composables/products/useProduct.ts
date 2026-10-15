import { ref } from 'vue'
import type { ApiClient } from '@/types/api'
import { useAlert } from '@/composables/alerts/useAlert'
import type { NewProduct, Product } from '@/schemas/products'
import type { Pagination } from '@/schemas/pagination'
import { parsePage, withLoading } from '@/utils/requests'

export function useProduct() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const products = ref<Product[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  // search: name, model or brand
  const filters = ref({ search: '' })

  async function fetchAllProducts(options?: { page?: number; perPage?: number }) {
    await withLoading(loading, async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('products', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
          search: filters.value.search || undefined,
        },
      })

      const page = parsePage(data, pagination.value.perPage)

      products.value = page.rows
      pagination.value = page.pagination
    })
  }

  async function fetchActiveProducts() {
    const { data } = await $api.get('products/active')
    let result: Product[] = []
    if (Array.isArray(data))
      result = data
    else if (data && Array.isArray(data.data))
      result = data.data

    products.value = result

    return result
  }

  const openAdd = ref(false)

  const newProduct = ref<NewProduct>({
    product_name: '',
    product_model_number: '',
    product_brand: '',
    category_uuid: '',
    default_price: 0,
  })

  function addProduct() {
    newProduct.value = {
      product_name: '',
      product_model_number: '',
      product_brand: '',
      category_uuid: '',
      default_price: 0,
    }
    openAdd.value = true
  }

  async function createProduct() {
    await withLoading(loading, async () => {
      const { data } = await $api.post('products/create', newProduct.value)

      showToast({
        title: 'Create New Product',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProducts()
      openAdd.value = false
    })
  }

  const openEdit = ref(false)
  const productToEdit = ref<Product | null>(null)

  function editProduct(product: Product) {
    productToEdit.value = { ...product }
    openEdit.value = true
  }

  async function updateProduct(updatedProduct: Product) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('products/update', updatedProduct)

      showToast({
        title: 'Update Product',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProducts()
      openEdit.value = false
    })
  }

  const openDelete = ref(false)
  const productToDelete = ref<Product | null>(null)

  function deleteProductModal(product: Product) {
    productToDelete.value = { ...product }
    openDelete.value = true
  }

  async function deleteProduct(product: Product) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('products/delete', {
        product_uuid: product.product_uuid,
      })

      showToast({
        title: 'Delete Product',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProducts()
      openDelete.value = false
    })
  }

  async function restoreProduct(product: Product) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('products/restore', {
        product_uuid: product.product_uuid,
      })

      showToast({
        title: 'Restore Product',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProducts()
    })
  }

  async function activateProduct(product: Product) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('products/updateStatus', {
        product_uuid: product.product_uuid,
        active: 1,
      })

      showToast({
        title: 'Activate Product',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProducts()
    })
  }

  async function deactivateProduct(product: Product) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('products/updateStatus', {
        product_uuid: product.product_uuid,
        active: 0,
      })

      showToast({
        title: 'Deactivate Product',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllProducts()
    })
  }

  async function importProductsCsv(file: File) {
    await withLoading(loading, async () => {
      const formData = new FormData()

      formData.append('file', file)

      const { data } = await $api.post('products/importProduct', formData)

      showToast({
        title: 'Import Successful',
        text: data.message || 'Products have been imported successfully.',
        color: 'success',
        icon: '$success',
      })

      await fetchAllProducts()
    })
  }

  return {
    showToast,
    loading,
    products,
    filters,
    pagination,
    fetchAllProducts,
    openAdd,
    addProduct,
    newProduct,
    createProduct,
    openEdit,
    productToEdit,
    editProduct,
    updateProduct,
    openDelete,
    productToDelete,
    deleteProductModal,
    deleteProduct,
    restoreProduct,
    activateProduct,
    deactivateProduct,
    fetchActiveProducts,
    importProductsCsv,
  }
}
