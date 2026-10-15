<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoles } from '@/composables/roles/useRoles'
import type { AppAbility } from '@/composables/auth/useAbility'
import { copyId } from '@/utils/clipboard'

definePageMeta({
  subject: 'v1/roles',
})

const {
  roles, loading, fetchAllRoles, openAdd, newRole, addRole, createRole, openEdit,
  roleToEdit, editRole, updateRole, openDelete, roleToDelete, deleteRoleModal,
  deleteRole, restoreRole, deactivateRole, activateRole,
} = useRoles()

const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
const canOpenMatrix = computed(() => $ability.can('access', 'v1/permission-matrix'))

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllRoles()
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <ListPage
    title="Roles"
    subtitle="Each user has one role. What a role may do is set under Who can do what."
    :loading="loading"
    :row-count="roles.length"
    :columns="3"
    empty-text="No roles yet. Add one, then give it permissions."
  >
    <template #actions>
      <VBtn
        v-if="canOpenMatrix"
        variant="outlined"
        color="default"
        to="/permission-matrix"
      >
        Who can do what
      </VBtn>
      <VBtn
        prepend-icon="tabler-plus"
        @click="addRole"
      >
        Add role
      </VBtn>
    </template>

    <template #head>
      <th>Role</th>
      <th>Description</th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="role in roles"
      :key="role.roles_uuid"
      :class="{ archived: role.deleted_at }"
    >
      <td class="py-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="font-weight-medium text-body-1">{{ role.role_name }}</span>
          <VChip
            v-if="role.deleted_at"
            color="error"
            size="small"
          >
            Archived
          </VChip>
          <VChip
            v-else-if="!role.active"
            color="warning"
            size="small"
          >
            Switched off
          </VChip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ role.role_slug }}
        </div>
      </td>
      <td
        class="text-body-1"
        style="max-inline-size: 48ch;"
      >
        {{ role.description }}
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${role.role_name}`"
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
              @click="editRole(role)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(role.roles_uuid, 'Role')"
            />
            <!-- Archived rows are restored, not switched on -->
            <template v-if="!role.deleted_at">
              <VDivider class="my-1" />
              <VListItem
                :prepend-icon="role.active ? 'tabler-shield-x' : 'tabler-shield-check'"
                :title="role.active ? 'Switch off' : 'Switch on'"
                @click="role.active ? deactivateRole(role) : activateRole(role)"
              />
              <VListItem
                prepend-icon="tabler-archive"
                title="Archive"
                base-color="error"
                @click="deleteRoleModal(role)"
              />
            </template>
            <VListItem
              v-else
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restoreRole(role)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

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
