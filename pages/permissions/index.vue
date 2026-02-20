<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { usePermissions } from '@/composables/permissions/usePermissions'

const {
  permissions, pagination, fetchAllPermissions, showToast, loading,
  openAdd, newPermission, addPermission, createPermission,
  openEdit, permissionToEdit, editPermission, updatePermission,
  openDelete, permissionToDelete, deletePermissionModal, deletePermission,
  restorePermission, activatePermission, deactivatePermission,
} = usePermissions()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllPermissions()
  }
  finally {
    loading.value = false
  }
})

const perPageOptions = [10, 25, 50, 100]

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllPermissions()
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'Permission ID copied to clipboard',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Permission Identity', key: 'permission_name', fixed: true },
  { title: 'Slug Identifier', key: 'permission_slug' },
  { title: 'Operation', key: 'permission_action', align: 'center' },
  { title: 'Status', key: 'active', align: 'center' },
  { title: 'Lifecycle', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null
    ? { class: 'deleted-row-active font-italic' }
    : {}
}
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1 border shadow-sm">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="42"
              rounded="lg"
            >
              <VIcon size="24">
                tabler-lock-access
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-black">System Permissions</span>
              <span class="text-caption text-medium-emphasis">Manage granular access control logic and API scopes</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            variant="elevated"
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
          class="flex-grow-1 permissions-table"
          :items-per-page="pagination.perPage"
          :row-props="getRowProps"
          hover
        >
          <template #item.permission_name="{ item }">
            <div class="d-flex align-center ga-3 py-3">
              <VAvatar
                size="34"
                color="primary"
                variant="tonal"
                class="border"
              >
                <span class="text-xs font-weight-bold">
                  {{ item.permission_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.permission_name }}
                </span>
                <span
                  class="text-xxs text-disabled text-truncate line-clamp-1"
                  style="max-width: 220px;"
                >
                  {{ item.description || 'No description provided' }}
                </span>
              </div>
            </div>
          </template>

          <template #item.permission_slug="{ item }">
            <div class="d-flex align-center">
              <VChip
                size="x-small"
                label
                color="secondary"
                variant="flat"
                class="font-weight-black  tracking-widest px-2"
              >
                {{ item.permission_slug }}
              </VChip>
            </div>
          </template>

          <template #item.permission_action="{ item }">
            <VChip
              size="x-small"
              variant="tonal"
              :color="item.permission_action === 'write' ? 'warning' : 'info'"
              label
              class="font-weight-black text-uppercase tracking-tighter"
            >
              {{ item.permission_action ?? 'read' }}
            </VChip>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex flex-column ga-1 text-xxs text-medium-emphasis">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-calendar-plus
                </VIcon>
                <TableDate :value="item.created_at" />
              </div>
              <div
                v-if="item.deleted_at"
                class="d-flex align-center ga-1 text-error font-weight-bold"
              >
                <VIcon size="12">
                  tabler-trash-x
                </VIcon>
                <TableDate :value="item.deleted_at" />
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <VMenu location="bottom end">
              <template #activator="{ props: menuProps }">
                <VBtn
                  icon="tabler-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="menuProps"
                />
              </template>

              <VList density="compact">
                <VListSubheader class="text-xxs font-weight-black uppercase tracking-widest">
                  Access Management
                </VListSubheader>

                <VListItem @click="editPermission(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Scope</VListItemTitle>
                </VListItem>

                <VListItem @click="copyUuid(item.permission_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-fingerprint
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivatePermission(item) : activatePermission(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-lock-off' : 'tabler-lock-check' }}
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-medium">
                    {{ item.active === 1 ? 'Deactivate' : 'Activate' }}
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  color="success"
                  @click="restorePermission(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Restore Permission
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  color="error"
                  @click="deletePermissionModal(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-archive
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Archive Permission
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4 bg-var-theme-surface">
              <div class="d-flex align-center ga-3">
                <span class="text-caption text-medium-emphasis font-weight-medium">Rows per page:</span>
                <VSelect
                  :model-value="pagination.perPage"
                  :items="perPageOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 85px"
                  @update:model-value="changePerPage"
                />
              </div>
              <div class="d-flex align-center ga-4">
                <span class="text-caption text-medium-emphasis">
                  Page <span class="text-high-emphasis font-weight-bold">{{ pagination.currentPage }}</span> of {{ pagination.lastPage }}
                </span>
                <VPagination
                  v-model="pagination.currentPage"
                  :length="pagination.lastPage"
                  :total-visible="5"
                  density="compact"
                  active-color="primary"
                  @update:model-value="(page) => fetchAllPermissions(page)"
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
.permissions-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Row Highlighting for Deleted Items */
.permissions-table :deep(.deleted-row-active td) {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.08) !important;
  color: rgba(var(--v-theme-on-surface,255,255,255), 0.6) !important;
}

.permissions-table :deep(.deleted-row-active td:first-child) {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.12) !important;
  border-right-color: rgba(var(--v-theme-error,255,255,255), 0.2) !important;
}

.permissions-table :deep(.deleted-row-active:hover td) {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.15) !important;
}

.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.tracking-widest { letter-spacing: 0.12em; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }
.font-italic { font-style: italic; }

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
