import type { ApiClient } from '@/types/api'
import { useAlert } from '@/composables/alerts/useAlert'
import type { NewTransaction, Transaction } from '@/schemas/transactions'
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

  async function fetchAllTransactions(options?: { page?: number; perPage?: number }) {
    await withLoading(loading, async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('transactions', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
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

  async function updateTransactionItemStatus(transactionUuid: string, transactionItemUuid: string, status: string,
  ) {
    await withLoading(loading, async () => {
      const { data } = await $api.post('transaction-items/updateStatus', {
        transaction_item_uuid: transactionItemUuid,
        status,
      })

      showToast({
        title: 'Update New Transaction',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllTransactions()
    })
  }

  async function updateTransactionStatus(transactionUuid: string, status: string) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('transactions/updateStatus', {
        transaction_uuid: transactionUuid,
        status,
      })

      showToast({
        title: 'Update Transaction Status',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllTransactions()
    })
  }

  return {
    transactions,
    loading,
    pagination,
    showToast,
    fetchAllTransactions,
    openAdd,
    newTransaction,
    addTransaction,
    createTransaction,
    updateTransactionItemStatus,
    updateTransactionStatus,
  }
}
