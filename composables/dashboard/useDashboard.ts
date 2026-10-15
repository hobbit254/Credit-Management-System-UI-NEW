import { ref } from 'vue'
import { withLoading } from '@/utils/requests'
import type { ApiClient } from '@/types/api'
import type { DashboardStats } from '@/schemas/dashboard_stats'

export function useDashboard() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)

  const dashboardStats = ref<DashboardStats>({
    products: [],
    transactions: [],
    payments: [],
    refunds: 0,
    owed: [],
    pending_payments: [],
  })

  async function fetchDashboardStats() {
    loading.value = true
    try {
      const response = await $api.get<any>('dashboard_stats')

      // The "Double Data" Drill-down:
      // response.data (Axios) -> .data (Your Backend)
      if (response?.data?.data)
        dashboardStats.value = response.data.data
    }
    catch (error) {
      console.error('Fetch Error:', error)
    }
    finally {
      loading.value = false
    }
  }

  // Errors are toasted by the API plugin; on success the queue and totals reload.
  async function decidePayment(paymentUuid: string, status: 'ACCEPTED' | 'REJECTED') {
    await withLoading(loading, async () => {
      await $api.put('payments/updateStatus', { payment_uuid: paymentUuid, status })
      await fetchDashboardStats()
    })
  }

  return {
    loading,
    dashboardStats,
    fetchDashboardStats,
    decidePayment,
  }
}
