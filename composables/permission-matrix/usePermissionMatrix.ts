import { ref } from 'vue'
import type { AxiosInstance } from 'axios'
import { useNuxtApp } from '#imports'
import { useAlert } from '~/composables/alerts/useAlert'
import type { Role } from '~/schemas/role'
import type { Permission } from '@/schemas/permissions'

interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

export function usePermissionMatrix() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const { alert: showToast } = useAlert()

  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const matrix = ref<Record<string, Set<string>>>({})

  const initialized = ref(false)

  /**
   * Fetch matrix data
   * Roles + mapping loaded ONCE
   * Permissions loaded EVERY page
   */
  async function fetchData(params?: { page?: number; perPage?: number }) {
    const page = params?.page ?? 1
    const perPage = params?.perPage ?? 10

    // 🔹 Load roles & mapping once
    if (!initialized.value) {
      const rolePermRes = await $api.get('permission-matrix')

      const rolesWithPerms: RoleWithPermissions[]
        = rolePermRes.data.data.roles.data

      roles.value = rolesWithPerms

      const map: Record<string, Set<string>> = {}

      rolesWithPerms.forEach(role => {
        map[role.roles_uuid] = new Set(
          role.permissions.map(p => p.permission_uuid),
        )
      })

      matrix.value = map
      initialized.value = true
    }

    // 🔹 Always load paginated permissions
    const permsRes = await $api.get(
      `permissions/active/paginate?page=${page}&perPage=${perPage}`,
    )

    permissions.value = permsRes.data.data[0]

    return permsRes.data.data[1] // pagination meta
  }

  function hasPermission(roleId: string, permId: string) {
    return matrix.value[roleId]?.has(permId) ?? false
  }

  async function toggle(roleId: string, permId: string) {
    const exists = hasPermission(roleId, permId)

    if (!matrix.value[roleId])
      matrix.value[roleId] = new Set()

    // 🔹 Optimistic update
    if (exists)
      matrix.value[roleId].delete(permId)
    else
      matrix.value[roleId].add(permId)

    try {
      await $api.post('permission-matrix/create', {
        roles_uuid: roleId,
        permission_uuid: permId,
      })

      showToast({
        title: exists ? 'Permission Removed' : 'Permission Added',
        text: exists
          ? 'Permission removed from role'
          : 'Permission assigned to role',
        color: 'success',
        icon: '$success',
      })
    }
    catch {
      // 🔹 Revert on failure
      if (exists)
        matrix.value[roleId].add(permId)
      else
        matrix.value[roleId].delete(permId)

      showToast({
        title: 'Update Failed',
        text: 'Could not update permission',
        color: 'error',
        icon: '$error',
      })
    }
  }

  return { roles, permissions, matrix, fetchData, hasPermission, toggle }
}
