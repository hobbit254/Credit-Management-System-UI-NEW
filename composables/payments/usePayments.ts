import type { ApiClient } from '@/types/api'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import type { NewPayment, Payment } from '@/schemas/payments'
import { parsePage, withLoading } from '@/utils/requests'

export function usePayments() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const payments = ref<Payment[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function fetchAllPayments(options?: { page?: number; perPage?: number }) {
    await withLoading(loading, async () => {
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

      const page = parsePage(data, pagination.value.perPage)

      payments.value = page.rows
      pagination.value = page.pagination
    })
  }

  async function updatePaymentStatus(paymentUuid: string, status: string) {
    await withLoading(loading, async () => {
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
    await withLoading(loading, async () => {
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
