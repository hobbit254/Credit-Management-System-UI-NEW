<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { DataTableHeader } from 'vuetify'
import { usePermissionMatrix } from '@/composables/permission-matrix/usePermissionMatrix'

// Composable provides roles, permissions, and helpers
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

// Load data with pagination
async function load(page = 1) {
  try {
    pending.value = true
    error.value = null

    const meta = await fetchData({
      page,
      perPage: pagination.perPage,
    })

    pagination.page = meta.currentPage
    pagination.total = meta.total
    pagination.lastPage = meta.lastPage
  }
  catch (e) {
    console.error(e)
    error.value = 'Failed to load permission matrix'
  }
  finally {
    pending.value = false
  }
}

// Headers must be reactive to roles
const headers = computed<DataTableHeader[]>(() => [
  { title: 'Permission', key: 'permission_info', sortable: true },
  ...roles.value.map(role => ({
    title: role.role_name,
    key: `role_${role.roles_uuid}`,
    align: 'center' as const,
    sortable: false, // prevent sorting on checkbox columns
  })),
])

onMounted(() => load())
watch(() => pagination.perPage, () => load(1))

// Options for rows per page
const perPageOptions = [5, 10, 25, 50, 100]
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1">
        <VCardTitle class="d-flex justify-space-between align-center">
          <span class="text-h6">Permission Matrix Table</span>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="permissions"
          :loading="pending"
          item-key="permission_uuid"
          :items-per-page="pagination.perPage"
          :page="pagination.page"
          class="flex-grow-1"
        >
          <!-- Permission Info Column -->
          <template #item.permission_info="{ item }">
            <div class="d-flex flex-column">
              <span class="text-body-2 font-weight-medium">{{ item.permission_name }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.permission_slug }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ item.permission_action }}
              </span>
            </div>
          </template>

          <!-- Dynamic Role Columns -->
          <template
            v-for="role in roles"
            :key="role.roles_uuid"
            #[`item.role_${role.roles_uuid}`]="{ item }"
          >
            <div class="d-flex justify-center align-center">
              <VCheckbox
                density="compact"
                hide-details
                :model-value="hasPermission(role.roles_uuid, item.permission_uuid)"
                @update:model-value="() => toggle(role.roles_uuid, item.permission_uuid)"
              />
            </div>
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
                  @update:model-value="val => { pagination.perPage = val }"
                />
              </div>

              <!-- CENTER: Page Info -->
              <span class="text-medium-emphasis text-sm">
                Page {{ pagination.page }} of {{ pagination.lastPage }}
              </span>

              <!-- RIGHT: Pagination -->
              <VPagination
                v-model="pagination.page"
                :length="pagination.lastPage"
                @update:model-value="page => load(page)"
              />
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>
</template>
