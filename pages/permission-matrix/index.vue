<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { usePermissionMatrix } from '@/composables/permission-matrix/usePermissionMatrix'
import { useAlert } from '@/composables/alerts/useAlert'
import { methodLabel } from '@/utils/formatters'

definePageMeta({
  subject: 'v1/permission-matrix',
})

const { roles, permissions, fetchData, hasPermission, toggle } = usePermissionMatrix()

const loading = ref(false)
const page = reactive({ currentPage: 1, perPage: 25, total: 0, lastPage: 1 })

async function load(currentPage = 1) {
  loading.value = true
  try {
    const meta = await fetchData({ page: currentPage, perPage: page.perPage })

    Object.assign(page, { currentPage: meta.currentPage, total: meta.total, lastPage: meta.lastPage })
  }
  catch (error: any) {
    // HTTP errors were already toasted by the API plugin.
    if (!error?.response)
      useAlert().alert({ title: 'Error', text: 'The permissions could not be loaded. Try again.', color: 'error', icon: '$error' })
  }
  finally {
    loading.value = false
  }
}

const pagination = computed(() => ({ ...page }))

onMounted(() => load())
</script>

<template>
  <ListPage
    title="Who can do what"
    subtitle="Switch a permission on for each role that needs it. Changes save straight away."
    :loading="loading"
    :pagination="pagination"
    :row-count="permissions.length"
    :columns="roles.length + 1"
    empty-text="No permissions yet. Add them under Permissions."
    @page="load"
  >
    <template #head>
      <th class="sticky-col">
        Permission
      </th>
      <th
        v-for="role in roles"
        :key="role.roles_uuid"
        class="text-center"
      >
        {{ role.role_name }}
      </th>
    </template>

    <tr
      v-for="permission in permissions"
      :key="permission.permission_uuid"
    >
      <td class="sticky-col py-3">
        <div class="font-weight-medium text-body-1">
          {{ permission.permission_name }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ methodLabel(permission.permission_action) }}
        </div>
      </td>
      <td
        v-for="role in roles"
        :key="role.roles_uuid"
      >
        <div class="d-flex justify-center">
          <!-- Named for its row and column: a screen reader would otherwise just say "switch, on" -->
          <VSwitch
            color="primary"
            density="compact"
            hide-details
            inset
            :aria-label="`${permission.permission_name} for ${role.role_name}`"
            :model-value="hasPermission(role.roles_uuid, permission.permission_uuid)"
            @update:model-value="() => toggle(role.roles_uuid, permission.permission_uuid)"
          />
        </div>
      </td>
    </tr>
  </ListPage>
</template>

<style scoped>
/* Keep the permission name in view while scrolling across roles. */
.sticky-col {
  position: sticky;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
  inset-inline-start: 0;
}
</style>
