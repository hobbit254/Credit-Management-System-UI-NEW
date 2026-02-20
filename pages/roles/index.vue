<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useRoles } from '@/composables/roles/useRoles'

const {
  showToast, roles, fetchAllRoles, openAdd, newRole, addRole, createRole, openEdit,
  roleToEdit, editRole, updateRole, openDelete, roleToDelete, deleteRoleModal,
  deleteRole, restoreRole, deactivateRole, activateRole,
} = useRoles()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)
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
    text: 'Role ID copied to clipboard',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Role Identity', key: 'role_name', fixed: true },
  { title: 'Slug Identifier', key: 'role_slug' },
  { title: 'Description', key: 'description', width: '250px' },
  { title: 'Status', key: 'active', align: 'center' },
  { title: 'Lifecycle', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

/**
 * Applies a specific class to the row if the item is deleted.
 * This class is then targeted in the <style> block.
 */
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
                tabler-shield-lock
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-black">System Roles</span>
              <span class="text-caption text-medium-emphasis">Configure access levels and permission groups</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            variant="elevated"
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
          class="flex-grow-1 roles-table"
          :items-per-page="-1"
          :row-props="getRowProps"
          hover
        >
          <template #item.role_name="{ item }">
            <div class="d-flex align-center ga-3 py-3">
              <VAvatar
                size="34"
                color="primary"
                variant="tonal"
                class="border"
              >
                <span class="text-xs font-weight-bold">
                  {{ item.role_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ item.role_name ?? '—' }}
                </span>
                <span class="text-xxs text-disabled font-mono text-truncate">
                  {{ item.roles_uuid }}
                </span>
              </div>
            </div>
          </template>

          <template #item.role_slug="{ item }">
            <VChip
              size="x-small"
              label
              color="secondary"
              variant="flat"
              class="font-weight-black text-uppercase tracking-widest px-2"
            >
              {{ item.role_slug }}
            </VChip>
          </template>

          <template #item.description="{ item }">
            <span class="text-caption text-medium-emphasis line-clamp-2">
              {{ item.description || 'No detailed description provided' }}
            </span>
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
                  Permission Management
                </VListSubheader>

                <VListItem @click="editRole(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Identity</VListItemTitle>
                </VListItem>

                <VListItem @click="copyUuid(item.roles_uuid)">
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
                  @click="item.active === 1 ? deactivateRole(item) : activateRole(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-shield-x' : 'tabler-shield-check' }}
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-medium">
                    {{ item.active === 1 ? 'Suspend Role' : 'Activate Role' }}
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  color="success"
                  @click="restoreRole(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Restore Role
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  color="error"
                  @click="deleteRoleModal(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-archive
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Archive Role
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-12 ga-2">
              <VIcon
                size="48"
                color="secondary"
                class="opacity-20"
              >
                tabler-shield-off
              </VIcon>
              <span class="text-body-1 font-weight-bold text-disabled">No System Roles Defined</span>
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
                @click="addRole"
              >
                <VIcon start>
                  tabler-plus
                </VIcon> Create First Role
              </VBtn>
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
/* Highlighting the entire row when deleted */
.roles-table :deep(.deleted-row-active td) {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.08) !important;
  color: rgba(var(--v-theme-on-surface,255,255,255), 0.6) !important;
}

/* Specific background for the sticky first column in deleted rows */
.roles-table :deep(.deleted-row-active td:first-child) {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.12) !important;
  border-right-color: rgba(var(--v-theme-error,255,255,255), 0.2) !important;
}

/* Hover state for deleted rows */
.roles-table :deep(.deleted-row-active:hover td) {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.15) !important;
}

/* Default Sticky Column Styling */
.roles-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Helper Utilities */
.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.tracking-widest { letter-spacing: 0.12em; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }
.opacity-60 { opacity: 0.6; }
.font-italic { font-style: italic; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
