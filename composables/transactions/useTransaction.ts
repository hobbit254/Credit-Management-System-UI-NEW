import type { ApiClient } from '@/types/api'
import { useAlert } from '@/composables/alerts/useAlert'
import type { NewRefund, NewTransaction, Transaction } from '@/schemas/transactions'
import type { Pagination } from '@/schemas/pagination'
import { parsePage, withLoading } from '@/utils/requests'

export function useTransaction() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const loading = ref(false)
  const { alert: showToast } = useAlert()
  const transactions = ref<Transaction[]>([])

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  // open: only sales that still owe money (UnPaid or Partially Paid).
  // search: customer, sales person or runner name; show 'open': only sales that still owe money
  const filters = ref({ search: '', show: 'all' })

  async function fetchAllTransactions(options?: { page?: number; perPage?: number; open?: boolean }) {
    await withLoading(loading, async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('transactions', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
          full_name: filters.value.search || undefined,
          ...(options?.open || filters.value.show === 'open' ? { open: 1 } : {}),
        },
      })

      const page = parsePage(data, pagination.value.perPage)

      transactions.value = page.rows
      pagination.value = page.pagination
    })
  }

  const openAdd = ref(false)

  const newTransaction = ref<NewTransaction>({
    sales_person_id: '',
    debtor_id: '',
    runner_id: '',
    transaction_type: '',
    transaction_items: [],
    payment_method: '',
    amount: '',
    reference_code: '',
  })

  function addTransaction() {
    newTransaction.value = {
      sales_person_id: '',
      debtor_id: '',
      runner_id: '',
      transaction_type: '',
      transaction_items: [],
      payment_method: '',
      amount: '',
      reference_code: '',
    }
    openAdd.value = true
  }

  async function createTransaction() {
    await withLoading(loading, async () => {
      const { data } = await $api.post('transactions/create', newTransaction.value)

      showToast({
        title: 'Create New Transaction',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllTransactions()
      openAdd.value = false
    })
  }

  // Returns whether it was saved; a return is refused while the sale has a pending payment.
  async function updateTransactionItemStatus(transactionUuid: string, transactionItemUuid: string, status: string,
    reason: string,
  ): Promise<boolean> {
    let saved = false

    await withLoading(loading, async () => {
      const { data } = await $api.post('transaction-items/updateStatus', {
        transaction_item_uuid: transactionItemUuid,
        status,
        reason,
      })

      saved = true

      showToast({
        title: 'Item Returned',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllTransactions()
    })

    return saved
  }

  // Returns whether it was saved, so a refused refund keeps its form open.
  async function recordRefund(refund: NewRefund): Promise<boolean> {
    let saved = false

    await withLoading(loading, async () => {
      const { data } = await $api.post('refunds/create', refund)

      saved = true
      showToast({ title: 'Refund Recorded', text: data.message, color: 'success', icon: '$success' })
      await fetchAllTransactions()
    })

    return saved
  }

  return {
    transactions,
    loading,
    pagination,
    filters,
    showToast,
    fetchAllTransactions,
    openAdd,
    newTransaction,
    addTransaction,
    createTransaction,
    updateTransactionItemStatus,
    recordRefund,
  }
}
