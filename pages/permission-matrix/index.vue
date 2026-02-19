<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { DataTableHeader } from 'vuetify'
import { usePermissionMatrix } from '@/composables/permission-matrix/usePermissionMatrix'

const {
  roles,
  permissions,
  fetchData,
  hasPermission,
  toggle,
} = usePermissionMatrix()

const pending = ref(false)
const error = ref<string | null>(null)

const pagination = reactive({
  page: 1,
  perPage: 10,
  total: 0,
  lastPage: 1,
})

async function load(page = 1) {
  try {
    pending.value = true
    error.value = null

    const meta = await fetchData({ page, perPage: pagination.perPage })

    pagination.page = meta.currentPage
    pagination.total = meta.total
    pagination.lastPage = meta.lastPage
  }
  catch (e) {
    error.value = 'Failed to load permission matrix'
  }
  finally {
    pending.value = false
  }
}

const headers = computed<DataTableHeader[]>(() => [
  { title: 'Permission Capability', key: 'permission_info', sortable: true, fixed: true, width: '300px' },
  ...roles.value.map(role => ({
    title: role.role_name,
    key: `role_${role.roles_uuid}`,
    align: 'center' as const,
    sortable: false,
    minWidth: '100px',
  })),
])

onMounted(() => load())
watch(() => pagination.perPage, () => load(1))

const perPageOptions = [5, 10, 25, 50, 100]
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
              color="secondary"
              variant="tonal"
              size="40"
            >
              <VIcon>tabler-matrix</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Access Control Matrix</span>
              <span class="text-caption text-medium-emphasis">Map system capabilities to user roles</span>
            </div>
          </div>

          <VBtn
            variant="tonal"
            prepend-icon="tabler-refresh"
            size="small"
            :loading="pending"
            @click="load(pagination.page)"
          >
            Sync Matrix
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="permissions"
          :loading="pending"
          item-key="permission_uuid"
          class="permission-matrix-table flex-grow-1"
          fixed-header
          hover
        >
          <template #item.permission_info="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VIcon
                size="20"
                :color="item.permission_action === 'POST' ? 'success' : 'info'"
              >
                {{ item.permission_action === 'POST' ? 'tabler-circle-plus' : 'tabler-eye' }}
              </VIcon>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.permission_name }}
                </span>
                <code class="text-xxs text-primary">{{ item.permission_slug }}</code>
              </div>
            </div>
          </template>

          <template
            v-for="role in roles"
            :key="role.roles_uuid"
            #[`item.role_${role.roles_uuid}`]="{ item }"
          >
            <div class="d-flex justify-center">
              <VSwitch
                color="primary"
                density="compact"
                hide-details
                inset
                :model-value="hasPermission(role.roles_uuid, item.permission_uuid)"
                @update:model-value="() => toggle(role.roles_uuid, item.permission_uuid)"
              />
            </div>
          </template>

          <template #loading>
            <div class="pa-10 text-center">
              <VProgressCircular
                indeterminate
                color="primary"
                class="mb-2"
              />
              <p class="text-caption">
                Rebuilding matrix...
              </p>
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
                  @update:model-value="val => { pagination.perPage = val }"
                />
              </div>

              <div class="d-flex align-center ga-4">
                <span class="text-caption text-medium-emphasis">
                  Page {{ pagination.page }} of {{ pagination.lastPage }}
                </span>
                <VPagination
                  v-model="pagination.page"
                  :length="pagination.lastPage"
                  :total-visible="5"
                  density="compact"
                  @update:model-value="page => load(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.permission-matrix-table :deep(thead th) {
  background-color: rgba(var(--v-theme-on-surface, 0,0,0), 0.02) !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.7rem !important;
  letter-spacing: 0.5px;
}

/* Make the first column sticky so you always know which permission you're looking at */
.permission-matrix-table :deep(td:first-child),
.permission-matrix-table :deep(th:first-child) {
  position: sticky !important;
  left: 0;
  z-index: 2;
  background: rgba(var(--v-theme-surface, 0,0,0), 0.02) !important;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.text-xxs {
  font-size: 0.65rem;
  line-height: 1;
}

/* Visual cue for active state in the grid */
.permission-matrix-table :deep(tr:hover) td {
  /* The ', #fff' acts as a fallback so the compiler doesn't panic */
  background-color: rgb(var(--v-theme-surface, 255, 255, 255)) !important;
  color: rgb(var(--v-theme-primary, 25, 118, 210)) !important;
}
</style>
