import type { AxiosInstance } from 'axios'
import { ref } from 'vue'
import type { DashboardStats } from '@/schemas/dashboard_stats'

export function useDashboard() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const loading = ref(false)

  const dashboardStats = ref<DashboardStats>({
    products: [],
    transactions: [],
    payments: [],
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

  return {
    loading,
    dashboardStats,
    fetchDashboardStats,
  }
}
