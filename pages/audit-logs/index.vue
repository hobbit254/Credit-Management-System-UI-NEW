<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import type { AuditLog } from '@/schemas/audit_logs'
import { useAuditLogs } from '@/composables/audit-logs/useAuditLogs'

const {
  auditLogs,
  loading,
  pagination,
  fetchAllAuditLogs,
} = useAuditLogs()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

// Filter States
const startDate = ref('')
const endDate = ref('')

// Modal State
const openDetailsModal = ref(false)
const selectedDetails = ref<any>(null)

const perPageOptions = [10, 25, 50, 100]

// Logic Functions
const viewDetails = (item: AuditLog) => {
  selectedDetails.value = item.details
  openDetailsModal.value = true
}

// Updated refresh/fetch to include dates
const refreshLogs = (page = 1) => {
  fetchAllAuditLogs({
    page,
    perPage: pagination.value.perPage,
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
  })
}

const changePerPage = (value: number) => {
  pagination.value.perPage = value
  refreshLogs(1)
}

const clearFilters = () => {
  startDate.value = ''
  endDate.value = ''
  refreshLogs(1)
}

const headers = [
  { title: 'User', key: 'full_name', fixed: true },
  { title: 'Action', key: 'action' },
  { title: 'Entity', key: 'entity' },
  { title: 'IP Address', key: 'details.ip' },
  { title: 'Device', key: 'details.userAgent' },
  { title: 'Timestamp', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

onMounted(async () => {
  refreshLogs()
})
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex flex-column ga-4"
    >
      <VCard class="border shadow-sm">
        <VCardText class="pa-4">
          <div class="d-flex flex-wrap align-center ga-4">
            <div
              class="d-flex align-center ga-2 flex-grow-1"
              style="max-width: 300px;"
            >
              <VTextField
                v-model="startDate"
                label="Start Date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="tabler-calendar-search"
              />
            </div>
            <div
              class="d-flex align-center ga-2 flex-grow-1"
              style="max-width: 300px;"
            >
              <VTextField
                v-model="endDate"
                label="End Date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="tabler-calendar-event"
              />
            </div>
            <div class="d-flex ga-2">
              <VBtn
                color="primary"
                prepend-icon="tabler-filter"
                :loading="loading"
                @click="refreshLogs(1)"
              >
                Apply
              </VBtn>
              <VBtn
                variant="tonal"
                color="secondary"
                icon="tabler-filter-off"
                @click="clearFilters"
              />
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="d-flex flex-column flex-grow-1 border shadow-sm">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-3">
            <VAvatar
              color="secondary"
              variant="tonal"
              size="42"
              rounded="lg"
            >
              <VIcon size="24">
                tabler-shield-lock
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">System Audit Logs</span>
              <span class="text-caption text-medium-emphasis">Track user activities and system changes</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-refresh"
            variant="tonal"
            :loading="loading"
            @click="refreshLogs(pagination.currentPage)"
          >
            Refresh
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="auditLogs"
          :loading="loading"
          class="flex-grow-1 audit-table"
          :items-per-page="pagination.perPage"
          hover
        >
          <template #item.full_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <span class="text-xs">{{ item.full_name.charAt(0) }}</span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-body-2 font-weight-bold">{{ item.full_name }}</span>
                <span class="text-xxs text-disabled">{{ item.role_name }}</span>
              </div>
            </div>
          </template>

          <template #item.action="{ item }">
            <code class="text-primary font-weight-bold text-xs">{{ item.action }}</code>
          </template>

          <template #item.entity="{ item }">
            <VChip
              size="x-small"
              variant="outlined"
              color="info"
              label
            >
              {{ item.entity.toUpperCase() }} : {{ item.entity_id }}
            </VChip>
          </template>

          <template #item.details.userAgent="{ item }">
            <div
              class="text-truncate text-xxs text-medium-emphasis"
              style="max-width: 200px;"
            >
              {{ item.details.userAgent }}
            </div>
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex flex-column text-xxs">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-calendar
                </VIcon>
                <TableDate :value="item.created_at" />
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <VBtn
              icon="tabler-eye"
              variant="text"
              size="small"
              color="primary"
              @click="viewDetails(item)"
            />
          </template>

          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4">
              <div class="d-flex align-center ga-3">
                <span class="text-caption text-medium-emphasis font-weight-medium">Items per page:</span>
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
                  @update:model-value="(page) => refreshLogs(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <VDialog
    v-model="openDetailsModal"
    max-width="600"
  >
    <VCard>
      <VCardTitle class="pa-4 d-flex justify-space-between align-center">
        <span>Request Metadata</span>
        <VBtn
          icon="tabler-x"
          variant="text"
          @click="openDetailsModal = false"
        />
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4 bg-grey-lighten-4">
        <pre
          class="text-xs font-mono"
          style="overflow-x: auto;"
        >{{ JSON.stringify(selectedDetails, null, 2) }}</pre>
      </VCardText>
      <VDivider />
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          @click="openDetailsModal = false"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.audit-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }
</style>
