import type { AxiosInstance } from 'axios'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import type { AuditLog } from '@/schemas/audit_logs'

export function useAuditLogs() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const auditLogs = ref<AuditLog[]>([])

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

  async function fetchAllAuditLogs(options?: {
    page?: number
    perPage?: number
    start_date?: string
    end_date?: string
  }): Promise<void> {
    await withLoading(async () => {
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

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      auditLogs.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    })
  }

  return {
    loading,
    auditLogs,
    fetchAllAuditLogs,
    pagination,
  }
}
