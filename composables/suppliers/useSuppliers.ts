import type { AxiosInstance } from 'axios'
import type { NewSupplier, Supplier } from '@/schemas/suppliers'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'

export function useSuppliers() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const { alert: showToast } = useAlert()

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function fetchAllSuppliers(options?: { page?: number; perPage?: number }) {
    loading.value = true
    try {
      if (options?.page)
        pagination.value.currentPage = options.page

      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('suppliers', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      suppliers.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    }
    finally {
      loading.value = false
    }
  }

  const openAdd = ref(false)

  const newSupplier = ref<NewSupplier>({
    supplier_name: '',
    supplier_shop_name: '',
    supplier_phone: '',
  })

  function addSupplier() {
    newSupplier.value = { supplier_shop_name: '', supplier_name: '', supplier_phone: '' }
    openAdd.value = true
  }

  async function createSupplier() {
    loading.value = true
    try {
      const { data } = await $api.post('suppliers/create', newSupplier.value)

      showToast({
        title: 'Create Supplier',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllSuppliers()
    }
    finally {
      loading.value = false
      openAdd.value = false
    }
  }

  const openEdit = ref(false)
  const supplierToEdit = ref<Supplier | null>(null)

  function editSupplier(supplier: Supplier) {
    supplierToEdit.value = { ...supplier }
    openEdit.value = true
  }

  async function updateSupplier(updated: Supplier) {
    loading.value = true
    try {
      const { data } = await $api.put('suppliers/update', updated)

      showToast({
        title: 'Update Supplier',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllSuppliers()
    }
    finally {
      loading.value = false
      openEdit.value = false
    }
  }

  const openDelete = ref(false)
  const supplierToDelete = ref<Supplier | null>(null)

  function deleteSupplierModal(supplier: Supplier) {
    supplierToDelete.value = { ...supplier }
    openDelete.value = true
  }

  async function deleteSupplier(supplier: Supplier) {
    loading.value = true
    try {
      const { data } = await $api.put('suppliers/delete', {
        supplier_uuid: supplier.supplier_uuid,
      })

      showToast({
        title: 'Delete Supplier',
        text: data.message,
        color: 'success',
        icon: '$success',
      })

      await fetchAllSuppliers()
    }
    finally {
      loading.value = false
      openDelete.value = false
    }
  }

  async function restoreSupplier(supplier: Supplier) {
    loading.value = true
    try {
      const { data } = await $api.put('suppliers/restore', {
        supplier_uuid: supplier.supplier_uuid,
      })

      showToast({
        title: 'Restore Supplier',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
    }
    finally {
      loading.value = false
    }
  }

  async function activateSupplier(supplier: Supplier) {
    loading.value = true
    try {
      const { data } = await $api.put('suppliers/updateStatus', {
        supplier_uuid: supplier.supplier_uuid,
        active: 1,
      })

      showToast({
        title: 'Activate Supplier',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllSuppliers()
    }
    finally {
      loading.value = false
    }
  }

  async function deactivateSupplier(supplier: Supplier) {
    loading.value = true
    try {
      const { data } = await $api.put('suppliers/updateStatus', {
        supplier_uuid: supplier.supplier_uuid,
        active: 0,
      })

      showToast({
        title: 'Deactivate Supplier',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllSuppliers()
    }
    finally {
      loading.value = false
    }
  }

  return {
    showToast,
    suppliers,
    loading,
    pagination,
    fetchAllSuppliers,
    newSupplier,
    openAdd,
    addSupplier,
    createSupplier,
    openEdit,
    supplierToEdit,
    editSupplier,
    updateSupplier,
    deactivateSupplier,
    activateSupplier,
    restoreSupplier,
    openDelete,
    supplierToDelete,
    deleteSupplierModal,
    deleteSupplier,
  }
}
