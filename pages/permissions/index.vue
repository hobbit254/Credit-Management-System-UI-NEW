<script setup lang="ts">
import { onMounted } from 'vue'
import { usePermissions } from '@/composables/permissions/usePermissions'

definePageMeta({
  subject: 'v1/permissions',
})

const {
  permissions, pagination, fetchAllPermissions, showToast, loading,
  openAdd, newPermission, addPermission, createPermission,
  openEdit, permissionToEdit, editPermission, updatePermission,
  openDelete, permissionToDelete, deletePermissionModal, deletePermission,
  restorePermission, activatePermission, deactivatePermission,
} = usePermissions()

onMounted(() => fetchAllPermissions())

// What the request method lets someone do.
const methodLabel: Record<string, string> = { GET: 'View', POST: 'Create', PUT: 'Change', PATCH: 'Change', DELETE: 'Delete' }

function copyId(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({ title: 'Copied', text: 'Permission ID copied', color: 'success', icon: 'tabler-clipboard-check' })
}
</script>

<template>
  <ListPage
    title="Permissions"
    subtitle="One per thing the app can do. Give them to roles under Who can do what."
    :loading="loading"
    :pagination="pagination"
    :row-count="permissions.length"
    :columns="4"
    empty-text="No permissions yet."
    @page="page => fetchAllPermissions({ page })"
  >
    <template #actions>
      <VBtn
        prepend-icon="tabler-plus"
        @click="addPermission"
      >
        Add permission
      </VBtn>
    </template>

    <template #head>
      <th>Permission</th>
      <th>Lets someone</th>
      <th>Description</th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="permission in permissions"
      :key="permission.permission_uuid"
      :class="{ archived: permission.deleted_at }"
    >
      <td class="py-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="font-weight-medium text-body-1">{{ permission.permission_name }}</span>
          <VChip
            v-if="permission.deleted_at"
            color="error"
            size="small"
          >
            Archived
          </VChip>
          <VChip
            v-else-if="!permission.active"
            color="warning"
            size="small"
          >
            Switched off
          </VChip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ permission.permission_slug }}
        </div>
      </td>
      <td class="text-body-1">
        {{ methodLabel[permission.permission_action] ?? permission.permission_action }}
      </td>
      <td
        class="text-body-1"
        style="max-inline-size: 48ch;"
      >
        {{ permission.description }}
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${permission.permission_name}`"
              icon="tabler-dots-vertical"
              variant="text"
              color="default"
              v-bind="menuProps"
            />
          </template>
          <VList>
            <VListItem
              prepend-icon="tabler-edit"
              title="Edit"
              @click="editPermission(permission)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(permission.permission_uuid)"
            />
            <!-- Archived rows are restored, not switched on -->
            <template v-if="!permission.deleted_at">
              <VDivider class="my-1" />
              <VListItem
                :prepend-icon="permission.active ? 'tabler-lock-off' : 'tabler-lock-check'"
                :title="permission.active ? 'Switch off' : 'Switch on'"
                @click="permission.active ? deactivatePermission(permission) : activatePermission(permission)"
              />
              <VListItem
                prepend-icon="tabler-archive"
                title="Archive"
                base-color="error"
                @click="deletePermissionModal(permission)"
              />
            </template>
            <VListItem
              v-else
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restorePermission(permission)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

  <CreatePermissionModal
    v-model:model-value="openAdd"
    v-model:permission="newPermission"
    :loading="loading"
    @confirm="createPermission"
  />
  <UpdatePermissionModal
    v-model:model-value="openEdit"
    v-model:permission="permissionToEdit"
    :loading="loading"
    @confirm="updatePermission"
  />
  <DeletePermissionModal
    v-model:model-value="openDelete"
    v-model:permission="permissionToDelete"
    :loading="loading"
    @confirm="deletePermission"
  />
</template>
