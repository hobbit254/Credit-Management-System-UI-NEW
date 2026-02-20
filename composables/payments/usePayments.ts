import type { AxiosInstance } from 'axios'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import type { NewPayment, Payment } from '@/schemas/payments'

export function usePayments() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const payments = ref<Payment[]>([])

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

  async function fetchAllPayments(options?: { page?: number; perPage?: number }) {
    await withLoading(async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('payments', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      payments.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    })
  }

  async function updatePaymentStatus(paymentUuid: string, status: string) {
    await withLoading(async () => {
      const { data } = await $api.put('payments/updateStatus', {
        payment_uuid: paymentUuid,
        status,
      })

      showToast({
        title: 'Update Payment Status',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPayments()
    })
  }

  async function createPayment(payment: NewPayment) {
    await withLoading(async () => {
      const { data } = await $api.post('payments/create', payment)

      showToast({
        title: 'Payment Created',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPayments()
    })
  }

  return {
    loading,
    pagination,
    showToast,
    updatePaymentStatus,
    fetchAllPayments,
    payments,
    createPayment,
  }
}
