import type { AxiosInstance } from 'axios'
import { ref } from 'vue'
import { useAlert } from '@/composables/alerts/useAlert'
import type { NewProduct, Product } from '@/schemas/products'
import type { Pagination } from '@/schemas/pagination'

export function useProduct() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const products = ref<Product[]>([])

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

  async function fetchAllProducts(options?: { page?: number; perPage?: number }) {
    await withLoading(async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('products', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      products.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    })
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
    await withLoading(async () => {
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
    await withLoading(async () => {
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
    await withLoading(async () => {
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
    await withLoading(async () => {
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
    await withLoading(async () => {
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
    await withLoading(async () => {
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

  return {
    showToast,
    loading,
    products,
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
  }
}
