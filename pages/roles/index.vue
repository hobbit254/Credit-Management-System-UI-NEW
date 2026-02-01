<script setup lang="ts">
import { ref } from 'vue'

import { useRoles } from '@/composables/roles/useRoles'

const {
  showToast, roles, fetchAllRoles, openAdd, newRole, addRole, createRole, openEdit, roleToEdit, editRole,
  updateRole, openDelete, roleToDelete, deleteRoleModal, deleteRole, restoreRole, deactivateRole, activateRole,
} = useRoles()

const loadingRoles = ref(false)

onMounted(async () => {
  loadingRoles.value = true
  try {
    await fetchAllRoles() // <-- no need to assign roles.value yourself
  }
  finally {
    loadingRoles.value = false
  }
})

const loading = ref(false)
function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'UUID copied to clipboard',
    color: 'success',
    icon: '$success',
  })
}
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1">
        <!-- Header with title and button -->
        <VCardTitle class="d-flex justify-space-between align-center">
          <span class="text-h6">Roles Table</span>
          <VBtn
            color="primary"
            @click="addRole"
          >
            Add Role
          </VBtn>
        </VCardTitle>

        <!-- Table body that grows and scrolls -->
        <VCardText class="flex-grow-1 pa-0 overflow-auto">
          <VTable
            fixed-header
            class="text-no-wrap"
            height="100%"
          >
            <thead>
              <tr>
                <th>UUID</th>
                <th>Role Name</th>
                <th>Role Slug</th>
                <th>Description</th>
                <th>Active</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Deleted At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="role in roles"
                :key="role.roles_uuid"
              >
                <td>{{ role.roles_uuid }}</td>
                <td>{{ role.role_name }}</td>
                <td>{{ role.role_slug }}</td>
                <td>{{ role.description }}</td>
                <!-- Status Badge -->
                <td>
                  <StatusBadge :active="role.active" />
                </td>
                <!-- Dates -->
                <td>
                  <TableDate :value="role.created_at" />
                </td>
                <td>
                  <TableDate :value="role.updated_at" />
                </td>
                <td>
                  <TableDate :value="role.deleted_at" />
                </td>
                <td>
                  <VMenu>
                    <template #activator="{ props: activatorProps }">
                      <VBtn
                        icon="tabler-dots"
                        variant="text"
                        v-bind="activatorProps"
                      />
                    </template>
                    <VList>
                      <VListSubheader>Actions</VListSubheader>

                      <!-- Copy UUID -->
                      <VListItem @click="copyUuid(role.roles_uuid)">
                        <div class="d-flex align-center gap-2">
                          <VIcon>tabler-copy</VIcon>
                          <span>Copy UUID</span>
                        </div>
                      </VListItem>

                      <VDivider />
                      <!-- Edit -->
                      <VListItem @click="editRole(role)">
                        <div class="d-flex align-center gap-2">
                          <VIcon>tabler-edit</VIcon>
                          <span>Edit Role</span>
                        </div>
                      </VListItem>
                      <!-- Delete -->
                      <VListItem
                        v-if="role.deleted_at !== null"
                        @click="restoreRole(role)"
                      >
                        <div class="d-flex align-center gap-2">
                          <VIcon>tabler-restore</VIcon>
                          <span>Restore Role</span>
                        </div>
                      </VListItem>
                      <VListItem
                        v-else
                        @click="deleteRoleModal(role)"
                      >
                        <div class="d-flex align-center gap-2">
                          <VIcon>tabler-trash</VIcon>
                          <span>Delete Role</span>
                        </div>
                      </VListItem>
                      <!-- Activation -->
                      <VListItem
                        v-if="role.active === 1"
                        @click="deactivateRole(role)"
                      >
                        <div class="d-flex align-center gap-2">
                          <VIcon> tabler-radio-off</VIcon>
                          <span>Deactivate Role</span>
                        </div>
                      </VListItem>
                      <VListItem
                        v-else
                        @click="activateRole(role)"
                      >
                        <div class="d-flex align-center gap-2">
                          <VIcon> tabler-radio</VIcon>
                          <span>Activate Role</span>
                        </div>
                      </VListItem>
                    </VList>
                  </VMenu>
                </td>
              </tr>
              <!-- Loading state -->
              <tr v-if="loadingRoles">
                <td
                  colspan="9"
                  class="text-center"
                >
                  Loading roles...
                </td>
              </tr>

              <!-- No data -->
              <tr v-if="!loadingRoles && roles.length === 0">
                <td
                  colspan="9"
                  class="text-center"
                >
                  No roles found.
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <CreateRoleModal
    v-model:model-value="openAdd"
    v-model:role="newRole"
    :loading="loading"
    @confirm="createRole"
  />
  <UpdateRoleModal
    v-model:model-value="openEdit"
    v-model:role="roleToEdit"
    :loading="loading"
    @confirm="updateRole"
  />
  <DeleteRoleModal
    v-model:model-value="openDelete"
    v-model:role="roleToDelete"
    :loading="loading"
    @confirm="deleteRole"
  />
</template>
