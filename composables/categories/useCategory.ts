import type { AxiosInstance } from 'axios'
import type { Category, NewCategory } from '@/schemas/category'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'

export function useCategory() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const { alert: showToast } = useAlert()

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

  async function fetchAllCategories(options?: { page?: number; perPage?: number }) {
    await withLoading(async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('categories', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      categories.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    })
  }

  async function fetchAllActiveCategories() {
    const { data } = await $api.get('categories/active')
    let results: Category[] = []
    if (Array.isArray(data))
      results = data
    else if (data && Array.isArray(data.data))
      results = data.data

    categories.value = results

    return results
  }

  const openAdd = ref(false)

  const newCategory = ref<NewCategory>({
    category_name: '',
  })

  function addCategory() {
    newCategory.value = {
      category_name: '',
    }
    openAdd.value = true
  }

  async function createCategory() {
    await withLoading(async () => {
      const { data } = await $api.post('categories/create', newCategory.value)

      showToast({
        title: 'Create New Category',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllCategories()
      openAdd.value = false
    })
  }

  const openEdit = ref(false)
  const categoryToEdit = ref<Category | null>(null)

  function editCategory(category: Category) {
    categoryToEdit.value = { ...category }
    openEdit.value = true
  }

  async function updateCategory(category: Category) {
    await withLoading(async () => {
      const { data } = await $api.put('categories/update', category)

      showToast({
        title: 'Update New Category',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllCategories()
      openEdit.value = false
    })
  }

  const openDelete = ref(false)
  const categoryToDelete = ref<Category | null>(null)

  function deleteCategoryModal(category: Category) {
    categoryToDelete.value = { ...category }
    openDelete.value = true
  }

  async function deleteCategory(category: Category) {
    await withLoading(async () => {
      const { data } = await $api.put('categories/delete', {
        category_uuid: category.category_uuid,
      })

      showToast({
        title: 'Delete Category',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllCategories()
      openDelete.value = false
    })
  }

  async function restoreCategory(category: Category) {
    await withLoading(async () => {
      const { data } = await $api.put('categories/restore', {
        category_uuid: category.category_uuid,
      })

      showToast({
        title: 'Restore Category',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllCategories()
    })
  }

  async function activateCategory(category: Category) {
    await withLoading(async () => {
      const { data } = await $api.put('categories/updateStatus', {
        category_uuid: category.category_uuid,
        active: 1,
      })

      showToast({
        title: 'Activate Category',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllCategories()
    })
  }

  async function deactivateCategory(category: Category) {
    await withLoading(async () => {
      const { data } = await $api.put('categories/updateStatus', {
        category_uuid: category.category_uuid,
        active: 0,
      })

      showToast({
        title: 'Deactivate Category',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllCategories()
    })
  }

  return {
    pagination,
    categories,
    loading,
    showToast,
    fetchAllCategories,
    fetchAllActiveCategories,
    openAdd,
    addCategory,
    newCategory,
    createCategory,
    editCategory,
    updateCategory,
    openEdit,
    categoryToEdit,
    categoryToDelete,
    deleteCategoryModal,
    openDelete,
    deleteCategory,
    restoreCategory,
    activateCategory,
    deactivateCategory,
  }
}
