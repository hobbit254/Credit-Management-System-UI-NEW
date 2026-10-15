import type { ApiClient } from '@/types/api'
import type { Debtor, NewDebtor } from '@/schemas/debtors'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'
import { parsePage, withLoading } from '@/utils/requests'

export function useDebtor() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const debtors = ref<Debtor[]>([])
  const loading = ref(false)
  const { alert: showToast } = useAlert()

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  // show: 'all' | 'owing' (still owes money) | 'over_limit' (owes more than their credit limit)
  const filters = ref({ search: '', show: 'all' })

  async function fetchAllDebtors(options?: { page?: number; perPage?: number }) {
    await withLoading(loading, async () => {
      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('debtors', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
          search: filters.value.search || undefined,
          show: filters.value.show === 'all' ? undefined : filters.value.show,
        },
      })

      const page = parsePage(data, pagination.value.perPage)

      debtors.value = page.rows
      pagination.value = page.pagination
    })
  }

  async function fetchAllActiveDebtors() {
    const { data } = await $api.get('debtors/active')

    const result: Debtor[] = Array.isArray(data?.data) ? data.data : []

    debtors.value = result // <-- update reactive state here

    return result
  }

  const openAdd = ref(false)

  const newDebtor = ref<NewDebtor>({
    debtor_name: '',
    debtor_email: '',
    debtor_phone: '',
    debtor_type: '',
    credit_limit: 0,
  })

  function addDebtor() {
    newDebtor.value = {
      debtor_name: '',
      debtor_email: '',
      debtor_phone: '',
      debtor_type: '',
      credit_limit: 0,
    }
    openAdd.value = true
  }

  async function createDebtor() {
    await withLoading(loading, async () => {
      const { data } = await $api.post('debtors/create', newDebtor.value)

      showToast({ title: 'Create New Debtor', text: data.message, color: 'success', icon: '$success' })
      await fetchAllDebtors()
      openAdd.value = false
    })
  }

  const openEdit = ref(false)
  const debtorToEdit = ref<Debtor | null>(null)

  function editDebtor(debtor: Debtor) {
    debtorToEdit.value = { ...debtor }
    openEdit.value = true
  }

  async function updateDebtor(updated: Debtor) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('debtors/update', updated)

      showToast({ title: 'Update Debtor Details', text: data.message, color: 'success', icon: '$success' })
      await fetchAllDebtors()
      openEdit.value = false
    })
  }

  const openDelete = ref(false)
  const debtorToDelete = ref<Debtor | null>(null)

  function deleteDebtorModal(debtor: Debtor) {
    debtorToDelete.value = { ...debtor }
    openDelete.value = true
  }

  async function deleteDebtor(debtor: Debtor) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('debtors/delete', { debtor_uuid: debtor.debtor_uuid })

      showToast({ title: 'Delete Debtor', text: data.message, color: 'success', icon: '$success' })
      await fetchAllDebtors()
      openDelete.value = false
    })
  }

  async function restoreDebtor(debtor: Debtor) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('debtors/restore', { debtor_uuid: debtor.debtor_uuid })

      showToast({ title: 'Restore Debtor', text: data.message, color: 'success', icon: '$success' })
      await fetchAllDebtors()
    })
  }

  async function activateDebtor(debtor: Debtor) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('debtors/updateStatus', { debtor_uuid: debtor.debtor_uuid, active: 1 })

      showToast({ title: 'Activate Debtor', text: data.message, color: 'success', icon: '$success' })
      await fetchAllDebtors()
    })
  }

  async function deactivateDebtor(debtor: Debtor) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('debtors/updateStatus', { debtor_uuid: debtor.debtor_uuid, active: 0 })

      showToast({ title: 'Deactivate Debtor', text: data.message, color: 'success', icon: '$success' })
      await fetchAllDebtors()
    })
  }

  return {
    debtors,
    loading,
    pagination,
    filters,
    showToast,
    fetchAllDebtors,
    openAdd,
    newDebtor,
    addDebtor,
    createDebtor,
    openEdit,
    debtorToEdit,
    editDebtor,
    updateDebtor,
    openDelete,
    deleteDebtorModal,
    debtorToDelete,
    deleteDebtor,
    restoreDebtor,
    activateDebtor,
    deactivateDebtor,
    fetchAllActiveDebtors,
  }
}
