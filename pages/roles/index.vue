<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoles } from '@/composables/roles/useRoles'

const {
  showToast, roles, fetchAllRoles, openAdd, newRole, addRole, createRole, openEdit,
  roleToEdit, editRole, updateRole, openDelete, roleToDelete, deleteRoleModal,
  deleteRole, restoreRole, deactivateRole, activateRole,
} = useRoles()

const loadingRoles = ref(false)

onMounted(async () => {
  loadingRoles.value = true
  try {
    await fetchAllRoles()
  }
  finally {
    loadingRoles.value = false
  }
})

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'UUID copied to clipboard',
    color: 'success',
    icon: '$success',
  })
}

const headers = [
  { title: 'Role', key: 'role_name' },
  { title: 'Slug', key: 'role_slug' },
  { title: 'Description', key: 'description' },
  { title: 'Active', key: 'active' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },
  { title: 'Deleted', key: 'deleted_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row' } : {}
}
</script>

<template>
  <VRow class="h-100">
    <VCol cols="12" class="h-100 d-flex">
      <VCard class="d-flex flex-column flex-grow-1">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-2">
            <VAvatar color="primary" variant="tonal" size="32">
              <VIcon size="18">tabler-shield-lock</VIcon>
            </VAvatar>
            <span class="text-h6 font-weight-bold">System Roles</span>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="addRole"
          >
            Add Role
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="roles"
          :loading="loadingRoles"
          item-key="roles_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
          :row-props="getRowProps"
        >
          <template #item.role_name="{ item }">
            <div class="d-flex align-center ga-3">
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.role_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-body-2">{{ item.role_name ?? '—' }}</span>
                <span class="text-xxs text-medium-emphasis font-mono">
                  {{ item.roles_uuid.split('-')[0] }}...
                </span>
              </div>
            </div>
          </template>

          <template #item.role_slug="{ item }">
            <VChip size="x-small" label color="secondary" variant="tonal" class="font-weight-bold">
              {{ item.role_slug }}
            </VChip>
          </template>

          <template #item.description="{ item }">
            <span class="text-caption text-medium-emphasis text-truncate" style="max-width: 200px; display: inline-block;">
              {{ item.description ?? 'No description provided' }}
            </span>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">tabler-calendar</VIcon>
              <TableDate :value="item.created_at" />
            </div>
          </template>

          <template #item.updated_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">tabler-clock-edit</VIcon>
              <TableDate :value="item.updated_at" />
            </div>
          </template>

          <template #item.deleted_at="{ item }">
            <div v-if="item.deleted_at" class="d-flex align-center ga-1 text-caption text-error">
              <VIcon size="13" color="error">tabler-trash</VIcon>
              <TableDate :value="item.deleted_at" />
            </div>
            <span v-else class="text-medium-emphasis">—</span>
          </template>

          <template #item.actions="{ item }">
            <VMenu>
              <template #activator="{ props: activatorProps }">
                <VBtn
                  icon="tabler-dots"
                  variant="text"
                  size="small"
                  v-bind="activatorProps"
                />
              </template>
              <VList density="compact">
                <VListSubheader>Actions</VListSubheader>

                <VListItem @click="copyUuid(item.roles_uuid)">
                  <template #prepend><VIcon size="18">tabler-copy</VIcon></template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem @click="editRole(item)">
                  <template #prepend><VIcon size="18">tabler-edit</VIcon></template>
                  <VListItemTitle>Edit Role</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreRole(item)"
                >
                  <template #prepend><VIcon size="18" color="success">tabler-restore</VIcon></template>
                  <VListItemTitle class="text-success">Restore</VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  @click="deleteRoleModal(item)"
                >
                  <template #prepend><VIcon size="18" color="error">tabler-trash</VIcon></template>
                  <VListItemTitle class="text-error">Delete</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivateRole(item) : activateRole(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-circle-off' : 'tabler-circle-check' }}
                    </VIcon>
                  </template>
                  <VListItemTitle>{{ item.active === 1 ? 'Deactivate' : 'Activate' }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10 ga-2">
              <VIcon size="48" color="secondary" class="opacity-50">tabler-shield-off</VIcon>
              <span class="text-body-1 text-medium-emphasis">No system roles found</span>
              <VBtn size="small" variant="tonal" color="primary" @click="addRole">Define New Role</VBtn>
            </div>
          </template>

          <template #bottom />
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <CreateRoleModal
    v-model:model-value="openAdd"
    v-model:role="newRole"
    :loading="loadingRoles"
    @confirm="createRole"
  />
  <UpdateRoleModal
    v-model:model-value="openEdit"
    v-model:role="roleToEdit"
    :loading="loadingRoles"
    @confirm="updateRole"
  />
  <DeleteRoleModal
    v-model:model-value="openDelete"
    v-model:role="roleToDelete"
    :loading="loadingRoles"
    @confirm="deleteRole"
  />
</template>

<style scoped>
:deep(.deleted-row) td {
  background-color: rgba(255, 82, 82, 0.12) !important;
}

:deep(.deleted-row:hover) td {
  background-color: rgba(255, 82, 82, 0.22) !important;
}

:deep(.v-data-table__tr:hover) td {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
