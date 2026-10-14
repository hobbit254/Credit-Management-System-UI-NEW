import type { ApiClient } from '@/types/api'
import type { Pagination } from '@/schemas/pagination'
import type { AuditLog } from '@/schemas/audit_logs'
import { parsePage, withLoading } from '@/utils/requests'

export function useAuditLogs() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)
  const auditLogs = ref<AuditLog[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function fetchAllAuditLogs(options?: {
    page?: number
    perPage?: number
    start_date?: string
    end_date?: string
  }): Promise<void> {
    await withLoading(loading, async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('audit_logs', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
          start_date: options?.start_date,
          end_date: options?.end_date,
        },
      })

      const page = parsePage(data, pagination.value.perPage)

      auditLogs.value = page.rows
      pagination.value = page.pagination
    })
  }

  return {
    loading,
    auditLogs,
    fetchAllAuditLogs,
    pagination,
  }
}
