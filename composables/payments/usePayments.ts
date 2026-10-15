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

  // status: 'all' or a payment status; search: receipt code or customer name
  const filters = ref({ search: '', status: 'all' })

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
          search: filters.value.search || undefined,
          status: filters.value.status === 'all' ? undefined : filters.value.status,
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

  // Returns whether it was saved, so a refused payment keeps its form open for correction.
  async function createPayment(payment: NewPayment): Promise<boolean> {
    let saved = false

    await withLoading(loading, async () => {
      const { data } = await $api.post('payments/create', payment)

      saved = true

      showToast({
        title: 'Payment Created',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPayments()
    })

    return saved
  }

  return {
    loading,
    pagination,
    filters,
    showToast,
    updatePaymentStatus,
    fetchAllPayments,
    payments,
    createPayment,
  }
}
