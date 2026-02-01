import type { AxiosInstance } from 'axios'
import type { NewPermission, Permission } from '@/schemas/permissions'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'

export function usePermissions() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const permissions = ref<Permission[]>([])
  const loading = ref(false)
  const { alert: showToast } = useAlert()

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function fetchAllPermissions(options?: { page?: number; perPage?: number }) {
    try {
      loading.value = true

      if (options?.page)
        pagination.value.currentPage = options.page
      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('/permissions', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      permissions.value = rows ?? []

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

  const newPermission = ref<NewPermission>({
    permission_name: '',
    description: '',
    permission_action: '',
  })

  function addPermission() {
    newPermission.value = { permission_name: '', description: '', permission_action: '' }
    openAdd.value = true
  }

  async function createPermission() {
    loading.value = true
    try {
      const { data } = await $api.post('permissions/create', newPermission.value)

      showToast({
        title: 'Create Permission',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPermissions()
    }
    finally {
      loading.value = false
      openAdd.value = false
    }
  }

  const openEdit = ref(false)
  const permissionToEdit = ref<Permission | null>(null)

  function editPermission(permission: Permission) {
    permissionToEdit.value = { ...permission }
    openEdit.value = true
  }

  async function updatePermission(updated: Permission) {
    loading.value = true
    try {
      const { data } = await $api.put('permissions/update', updated)

      showToast({
        title: 'Update Permission',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPermissions()
    }
    finally {
      loading.value = false
      openEdit.value = false
    }
  }

  const openDelete = ref(false)
  const permissionToDelete = ref<Permission | null>(null)

  function deletePermissionModal(permission: Permission) {
    permissionToDelete.value = permission
    openDelete.value = true
  }

  async function deletePermission(permission: Permission) {
    loading.value = true
    try {
      const { data } = await $api.put('permissions/delete', {
        permission_uuid: permission.permission_uuid,
      })

      showToast({
        title: 'Delete Permission',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPermissions()
    }
    finally {
      loading.value = false
      openDelete.value = false
    }
  }

  async function restorePermission(restored: Permission) {
    loading.value = true
    try {
      const { data } = await $api.put('permissions/restore', {
        permission_uuid: restored.permission_uuid,
      })

      showToast({
        title: 'Restore Permission',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPermissions()
    }
    finally {
      loading.value = false
    }
  }

  async function activatePermission(activated: Permission) {
    loading.value = true
    try {
      const { data } = await $api.put('permissions/updateStatus', {
        permission_uuid: activated.permission_uuid,
        active: 1,
      })

      showToast({
        title: 'Activate Permission',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPermissions()
    }
    finally {
      loading.value = false
    }
  }

  async function deactivatePermission(deactivated: Permission) {
    loading.value = true
    try {
      const { data } = await $api.put('permissions/updateStatus', {
        permission_uuid: deactivated.permission_uuid,
        active: 0,
      })

      showToast({
        title: 'Deactivate Permission',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllPermissions()
    }
    finally {
      loading.value = false
    }
  }

  return {
    permissions,
    pagination,
    fetchAllPermissions,
    showToast,
    loading,
    openAdd,
    newPermission,
    addPermission,
    createPermission,
    openEdit,
    permissionToEdit,
    editPermission,
    updatePermission,
    openDelete,
    permissionToDelete,
    deletePermissionModal,
    deletePermission,
    restorePermission,
    activatePermission,
    deactivatePermission,
  }
}
