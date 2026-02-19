<script setup lang="ts">
import { usePermissions } from '@/composables/permissions/usePermissions'
import CreatePermissionModal from '@/components/permissions/CreatePermissionModal.vue'
import UpdatePermissionModal from '@/components/permissions/UpdatePermissionModal.vue'
import DeletePermissionModal from '@/components/permissions/DeletePermissionModal.vue'

const perPageOptions = [5, 10, 25, 50, 100]

const {
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
} = usePermissions()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllPermissions()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllPermissions()
}

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
  { title: 'Permission', key: 'permission_name' },
  { title: 'Slug', key: 'permission_slug' },
  { title: 'Action', key: 'permission_action' },
  { title: 'Status', key: 'active' },
  { title: 'Timeline', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row' } : {}
}
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-2">
            <VAvatar
              color="primary"
              variant="tonal"
              size="32"
            >
              <VIcon size="18">
                tabler-lock-access
              </VIcon>
            </VAvatar>
            <span class="text-h6 font-weight-bold">System Permissions</span>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="addPermission"
          >
            Add Permission
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="permissions"
          :loading="loading"
          item-key="permission_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
          :row-props="getRowProps"
        >
          <template #item.permission_name="{ item }">
            <div class="d-flex align-center ga-3">
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.permission_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-body-2">{{ item.permission_name ?? '—' }}</span>
                <span
                  class="text-xxs text-medium-emphasis text-truncate"
                  style="max-width: 180px;"
                >
                  {{ item.description ?? 'No description' }}
                </span>
              </div>
            </div>
          </template>

          <template #item.permission_slug="{ item }">
            <code class="text-primary font-weight-bold text-xs">
              {{ item.permission_slug }}
            </code>
          </template>

          <template #item.permission_action="{ item }">
            <VChip
              size="x-small"
              variant="tonal"
              :color="item.permission_action === 'write' ? 'warning' : 'info'"
              label
              class="font-weight-bold text-uppercase"
            >
              {{ item.permission_action ?? 'read' }}
            </VChip>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-1 text-xxs text-medium-emphasis">
                <VIcon size="12">
                  tabler-calendar-plus
                </VIcon>
                <TableDate :value="item.created_at" />
              </div>
              <div
                v-if="item.deleted_at"
                class="d-flex align-center ga-1 text-xxs text-error"
              >
                <VIcon size="12">
                  tabler-trash-x
                </VIcon>
                <TableDate :value="item.deleted_at" />
              </div>
            </div>
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

                <VListItem @click="copyUuid(item.permission_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-copy
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem @click="editPermission(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Permission</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restorePermission(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="18"
                      color="success"
                    >
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle class="text-success">
                    Restore
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  @click="deletePermissionModal(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="18"
                      color="error"
                    >
                      tabler-trash
                    </VIcon>
                  </template>
                  <VListItemTitle class="text-error">
                    Delete
                  </VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivatePermission(item) : activatePermission(item)"
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
            <div class="d-flex flex-column align-center justify-center pa-12 ga-2">
              <VIcon
                size="48"
                color="secondary"
                class="opacity-50"
              >
                tabler-lock-off
              </VIcon>
              <span class="text-body-1 text-medium-emphasis">No permissions found</span>
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
                @click="addPermission"
              >
                Create first permission
              </VBtn>
            </div>
          </template>

          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4">
              <div class="d-flex align-center ga-2">
                <span class="text-caption text-medium-emphasis">Rows per page</span>
                <VSelect
                  :model-value="pagination.perPage"
                  :items="perPageOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 80px"
                  @update:model-value="changePerPage"
                />
              </div>
              <div class="d-flex align-center ga-4">
                <span class="text-caption text-medium-emphasis">
                  Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
                </span>
                <VPagination
                  v-model="pagination.currentPage"
                  :length="pagination.lastPage"
                  :total-visible="5"
                  density="compact"
                  @update:model-value="(page: number) => fetchAllPermissions(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

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
