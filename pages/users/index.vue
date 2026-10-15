<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '@/composables/users/useUsers'

definePageMeta({
  subject: 'v1/users',
})

const {
  users, pagination, fetchAllUsers, showToast, loading,
  openAdd, newUser, addUser, createUser,
  openEdit, editUser, updateUser, userToEdit,
  openDelete, deleteUserModal, deleteUser, userToDelete,
  restoreUser, activateUser, deactivateUser,
} = useUsers()

onMounted(() => fetchAllUsers())

function copyId(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({ title: 'Copied', text: 'User ID copied', color: 'success', icon: 'tabler-clipboard-check' })
}
</script>

<template>
  <ListPage
    title="Users"
    subtitle="Staff who can sign in. Their role decides what they can see and do."
    :loading="loading"
    :pagination="pagination"
    :row-count="users.length"
    :columns="4"
    empty-text="No users yet."
    @page="page => fetchAllUsers({ page })"
  >
    <template #actions>
      <VBtn
        prepend-icon="tabler-user-plus"
        @click="addUser"
      >
        Add user
      </VBtn>
    </template>

    <template #head>
      <th>Name</th>
      <th>Role</th>
      <th>Email</th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="user in users"
      :key="user.user_uuid"
      :class="{ archived: user.deleted_at }"
    >
      <td class="py-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="font-weight-medium text-body-1">{{ user.full_name }}</span>
          <VChip
            v-if="user.deleted_at"
            color="error"
            size="small"
          >
            Archived
          </VChip>
          <VChip
            v-else-if="!user.active"
            color="warning"
            size="small"
          >
            Can't sign in
          </VChip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ user.email }}
        </div>
      </td>
      <td class="text-body-1">
        {{ user.roles?.[0]?.role_name ?? 'No role' }}
      </td>
      <td
        class="text-body-2"
        :class="user.email_verified_at ? 'text-medium-emphasis' : 'text-warning font-weight-medium'"
      >
        {{ user.email_verified_at ? 'Verified' : 'Not verified yet' }}
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${user.full_name}`"
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
              @click="editUser(user)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(user.user_uuid)"
            />
            <!-- Archived rows are restored, not activated -->
            <template v-if="!user.deleted_at">
              <VDivider class="my-1" />
              <VListItem
                :prepend-icon="user.active ? 'tabler-user-off' : 'tabler-user-check'"
                :title="user.active ? 'Stop sign-in' : 'Allow sign-in'"
                @click="user.active ? deactivateUser(user) : activateUser(user)"
              />
              <VListItem
                prepend-icon="tabler-archive"
                title="Archive"
                base-color="error"
                @click="deleteUserModal(user)"
              />
            </template>
            <VListItem
              v-else
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restoreUser(user)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

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
