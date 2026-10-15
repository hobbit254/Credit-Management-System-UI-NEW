import type { ApiClient } from '@/types/api'
import type { Pagination } from '@/schemas/pagination'
import type { Collector } from '@/schemas/collectors'
import { withLoading } from '@/utils/requests'

export function useCollectors() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)
  const collectors = ref<Collector[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function fetchAllActiveCollectors() {
    let result: Collector[] = []

    await withLoading(loading, async () => {
      const { data } = await $api.get('collectors/active')

      result = Array.isArray(data?.data) ? data.data : []

      collectors.value = result
    })

    return result
  }

  return {
    loading,
    collectors,
    pagination,
    fetchAllActiveCollectors,
  }
}
