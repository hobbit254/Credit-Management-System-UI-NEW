import { ref } from 'vue'
import type { ApiClient } from '@/types/api'
import type { NewRole, Role } from '@/schemas/role'
import { useAlert } from '@/composables/alerts/useAlert'
import { withLoading } from '@/utils/requests'

export function useRoles() {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const { alert: showToast } = useAlert()

  async function fetchAllRoles() {
    const { data } = await $api.get('roles')

    const result: Role[] = Array.isArray(data?.data) ? data.data : []

    roles.value = result // <-- update reactive state here

    return result
  }

  async function fetchAllActiveRoles() {
    const { data } = await $api.get('roles/active')

    const result: Role[] = Array.isArray(data?.data) ? data.data : []

    roles.value = result // <-- update reactive state here

    return result
  }

  const openAdd = ref(false)

  const newRole = ref<NewRole>({
    role_name: '',
    description: '',
  })

  function addRole() {
    newRole.value = { role_name: '', description: '' }
    openAdd.value = true
  }

  async function createRole() {
    await withLoading(loading, async () => {
      const { data } = await $api.post('roles/create', newRole.value)

      if (data.status === 'success') {
        showToast({
          title: 'Create Role',
          text: data.message,
          color: 'success',
          icon: '$success',
        })
      }
      await fetchAllRoles()
      openAdd.value = false
    })
  }

  const openEdit = ref(false)
  const roleToEdit = ref<Role | null>(null)

  function editRole(role: Role) {
    roleToEdit.value = { ...role }
    openEdit.value = true
  }

  async function updateRole(updated: Role) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('roles/update', updated)

      showToast({
        title: 'Update Role',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllRoles()
      openEdit.value = false
    })
  }

  const openDelete = ref(false)
  const roleToDelete = ref<Role | null>(null)

  function deleteRoleModal(role: Role) {
    roleToDelete.value = role
    openDelete.value = true
  }

  async function deleteRole(deleted: Role) {
    await withLoading(loading, async () => {
      const { data } = await $api.put('roles/delete', {
        roles_uuid: deleted.roles_uuid,
      })

      showToast({
        title: 'Delete Role',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllRoles()
      openDelete.value = false
    })
  }

  async function restoreRole(restored: Role) {
    loading.value = true
    try {
      const { data } = await $api.put('roles/restore', {
        roles_uuid: restored.roles_uuid,
      })

      showToast({
        title: 'Restore Role',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllRoles()
    }
    finally {
      loading.value = false
    }
  }

  async function deactivateRole(deactivated: Role) {
    loading.value = true
    try {
      const { data } = await $api.put('roles/updateStatus', {
        roles_uuid: deactivated.roles_uuid,
        active: 0,
      })

      showToast({
        title: 'Deactivate Role',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllRoles()
    }

    finally {
      loading.value = false
    }
  }

  async function activateRole(deactivated: Role) {
    loading.value = true
    try {
      const { data } = await $api.put('roles/updateStatus', {
        roles_uuid: deactivated.roles_uuid,
        active: 1,
      })

      showToast({
        title: 'Activate Role',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllRoles()
    }

    finally {
      loading.value = false
    }
  }

  return {
    showToast,
    roles,
    fetchAllRoles,
    loading,
    openAdd,
    newRole,
    addRole,
    createRole,
    openEdit,
    roleToEdit,
    editRole,
    updateRole,
    openDelete,
    roleToDelete,
    deleteRoleModal,
    deleteRole,
    restoreRole,
    deactivateRole,
    activateRole,
    fetchAllActiveRoles,
  }
}
