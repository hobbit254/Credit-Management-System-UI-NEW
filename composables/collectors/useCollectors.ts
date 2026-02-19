import type { AxiosInstance } from 'axios'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import type { Collector } from '@/schemas/collectors'

export function useCollectors() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const collectors = ref<Collector[]>([])

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

  async function fetchAllActiveCollectors() {
    const { data } = await $api.get('collectors/active')

    let result: Collector[] = []
    if (Array.isArray(data))
      result = data
    else if (data && Array.isArray(data.data))
      result = data.data

    collectors.value = result // <-- update reactive state here

    return result
  }

  return {
    loading,
    collectors,
    pagination,
    fetchAllActiveCollectors,
  }
}
