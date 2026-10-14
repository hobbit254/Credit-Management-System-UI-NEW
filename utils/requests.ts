import type { Ref } from 'vue'
import type { Pagination } from '@/schemas/pagination'
import { useAlert } from '@/composables/alerts/useAlert'

// Runs fn with `loading` set. HTTP errors were already toasted with the server's
// message by plugins/01.api.ts, so only other errors get a toast here.
export async function withLoading(loading: Ref<boolean>, fn: () => Promise<void>) {
  loading.value = true
  try {
    await fn()
  }
  catch (error: any) {
    if (!error?.response)
      useAlert().alert({ title: 'Error', text: error?.message ?? 'Something went wrong', color: 'error', icon: '$error' })
  }
  finally {
    loading.value = false
  }
}

// List endpoints return `data` as a [rows, meta] tuple (or [] when empty); older ones as { rows, pagination }.
export function parsePage(body: any, perPage: number): { rows: any[]; pagination: Pagination } {
  const data = body?.data
  const [rows, meta] = Array.isArray(data) ? data : [data?.rows, data?.pagination]

  return {
    rows: rows ?? [],
    pagination: { total: meta?.total ?? 0, perPage, currentPage: meta?.currentPage ?? 1, lastPage: meta?.lastPage ?? 1 },
  }
}
