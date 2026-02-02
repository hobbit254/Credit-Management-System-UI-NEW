<script setup lang="ts">
import { useUsers } from '@/composables/users/useUsers'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  users,
  pagination,
  fetchAllUsers,
  showToast,
  loading,
  openAdd,
  newUser,
  addUser,
  createUser,
  openEdit,
  editUser,
  updateUser,
  userToEdit,
  openDelete,
  deleteUserModal,
  deleteUser,
  userToDelete,
  restoreUser,
  activateUser,
  deactivateUser,
} = useUsers()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllUsers()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllUsers()
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
  { title: 'Full Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'roles.0.role_name' },
  { title: 'Active', key: 'active' },
  { title: 'Created', key: 'created_at' },
  { title: 'Email Verified Data', key: 'email_verified_at' },
  { title: 'Updated', key: 'updated_at' },
  { title: 'Deleted', key: 'deleted_at' },
  { title: 'Actions', key: 'actions' },
]
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1">
        <VCardTitle class="d-flex justify-space-between align-center">
          <span class="text-h6">Users Table</span>
          <VBtn
            color="primary"
            @click="addUser"
          >
            Add User
          </VBtn>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="users"
          :loading="loading"
          item-key="user_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
        >
          <!-- Status Badge -->
          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <!-- Dates -->
          <template #item.email_verified_at="{ item }">
            <TableDate :value="item.email_verified_at" />
          </template>
          <template #item.created_at="{ item }">
            <TableDate :value="item.created_at" />
          </template>
          <template #item.updated_at="{ item }">
            <TableDate :value="item.updated_at" />
          </template>
          <template #item.deleted_at="{ item }">
            <TableDate :value="item.deleted_at" />
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <VMenu>
              <template #activator="{ props }">
                <VBtn
                  icon="tabler-dots"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <VList>
                <VListSubheader>Actions</VListSubheader>
                <VListItem @click="copyUuid(item.user_uuid)">
                  <VIcon>tabler-copy</VIcon>
                  <span class="ms-2">Copy UUID</span>
                </VListItem>
                <VDivider />

                <VListItem @click="editUser(item)">
                  <VIcon>tabler-edit</VIcon>
                  <span class="ms-2">Edit User</span>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreUser(item)"
                >
                  <VIcon>tabler-restore</VIcon>
                  <span class="ms-2">Restore User</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="deleteUserModal(item)"
                >
                  <VIcon>tabler-trash</VIcon>
                  <span class="ms-2">Delete User</span>
                </VListItem>
                <VListItem
                  v-if="item.active === 1"
                  @click="deactivateUser(item)"
                >
                  <VIcon>tabler-radio-off</VIcon>
                  <span class="ms-2">Deactivate User</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="activateUser(item)"
                >
                  <VIcon>tabler-radio</VIcon>
                  <span class="ms-2">Activate User</span>
                </VListItem>
              </vlist>
            </VMenu>
          </template>

          <!-- Bottom Pagination Slot -->
          <template #bottom>
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4">
              <!-- LEFT: Items Per Page -->
              <div class="d-flex align-center ga-2">
                <span class="text-medium-emphasis text-sm">Rows per page</span>

                <VSelect
                  :model-value="pagination.perPage"
                  :items="perPageOptions"
                  density="compact"
                  variant="outlined"
                  style="width: 90px"
                  @update:model-value="changePerPage"
                />
              </div>

              <!-- CENTER: Page Info -->
              <span class="text-medium-emphasis text-sm">
                Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
              </span>

              <!-- RIGHT: Pagination -->
              <VPagination
                v-model="pagination.currentPage"
                :length="pagination.lastPage"
                @update:model-value="(page: number) => fetchAllUsers(page)"
              />
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
