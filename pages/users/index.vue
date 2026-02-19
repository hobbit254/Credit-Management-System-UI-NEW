<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useUsers } from '@/composables/users/useUsers'

const {
  users, pagination, fetchAllUsers, showToast, loading,
  openAdd, newUser, addUser, createUser,
  openEdit, editUser, updateUser, userToEdit,
  openDelete, deleteUserModal, deleteUser, userToDelete,
  restoreUser, activateUser, deactivateUser,
} = useUsers()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllUsers()
  }
  finally {
    loading.value = false
  }
})

const perPageOptions = [5, 10, 25, 50, 100]

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllUsers()
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'User UUID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'User Identity', key: 'full_name', fixed: true },
  { title: 'Access Role', key: 'roles.0.role_name' },
  { title: 'Status', key: 'active' },
  { title: 'Verified', key: 'email_verified_at', align: 'center' },
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
      <VCard class="d-flex flex-column flex-grow-1 border">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="40"
            >
              <VIcon>tabler-users</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">User Management</span>
              <span class="text-caption text-medium-emphasis">Manage system users, roles, and status</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-user-plus"
            @click="addUser"
          >
            Add User
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="users"
          :loading="loading"
          item-key="user_uuid"
          class="flex-grow-1 user-table"
          :items-per-page="-1"
          :row-props="getRowProps"
          hover
        >
          <template #item.full_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VAvatar
                size="38"
                color="primary"
                variant="tonal"
              >
                <span class="text-body-2 font-weight-bold">
                  {{ item.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.full_name }}
                </span>
                <span class="text-xxs text-medium-emphasis font-mono">
                  {{ item.email }}
                </span>
              </div>
            </div>
          </template>

          <template #item.roles.0.role_name="{ item }">
            <VChip
              v-if="item.roles?.[0]"
              size="x-small"
              color="secondary"
              variant="tonal"
              label
              class="font-weight-bold text-uppercase"
            >
              {{ item.roles[0].role_name }}
            </VChip>
            <span
              v-else
              class="text-xxs text-medium-emphasis italic"
            >No Role Assigned</span>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.email_verified_at="{ item }">
            <VIcon
              :color="item.email_verified_at ? 'success' : 'warning'"
              size="18"
            >
              {{ item.email_verified_at ? 'tabler-circle-check' : 'tabler-circle-x' }}
            </VIcon>
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
                class="d-flex align-center ga-1 text-error"
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
                <VListSubheader>User Actions</VListSubheader>
                <VListItem @click="copyUuid(item.user_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-copy
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem @click="editUser(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-user-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Details</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreUser(item)"
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
                    Restore Account
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  @click="deleteUserModal(item)"
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
                    Remove User
                  </VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivateUser(item) : activateUser(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-user-off' : 'tabler-user-check' }}
                    </VIcon>
                  </template>
                  <VListItemTitle>{{ item.active === 1 ? 'Deactivate' : 'Activate' }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
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
                  @update:model-value="(page: number) => fetchAllUsers(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <CreateUserModal
    v-model:model-value="openAdd"
    v-model:user="newUser"
    :loading="loading"
    @confirm="createUser"
  />
  <UpdateUserModal
    v-model:model-value="openEdit"
    v-model:user="userToEdit"
    :loading="loading"
    @confirm="updateUser"
  />
  <DeleteUserModal
    v-model:model-value="openDelete"
    v-model:user="userToDelete"
    :loading="loading"
    @confirm="deleteUser"
  />
</template>

<style scoped>
.user-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep(.deleted-row) td {
  background-color: rgba(var(--v-theme-error, 255, 82, 82), 0.08) !important;
  color: rgb(var(--v-theme-error, 255, 82, 82)) !important;
}

.text-xxs {
  font-size: 0.65rem;
}
</style>
