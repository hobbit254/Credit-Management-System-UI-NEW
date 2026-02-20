<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useDebtor } from '@/composables/debtors/useDebtor'

const {
  debtors, loading, pagination, showToast, fetchAllDebtors,
  openAdd, newDebtor, addDebtor, createDebtor,
  openEdit, debtorToEdit, editDebtor, updateDebtor,
  openDelete, deleteDebtorModal, debtorToDelete, deleteDebtor,
  restoreDebtor, activateDebtor, deactivateDebtor,
} = useDebtor()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllDebtors()
  }
  finally {
    loading.value = false
  }
})

const perPageOptions = [5, 10, 25, 50, 100]

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllDebtors()
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'Debtor ID copied to clipboard',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Debtor Identity', key: 'debtor_name', fixed: true },
  { title: 'Type', key: 'debtor_type', width: '120px' },
  { title: 'Credit Limit', key: 'credit_limit', align: 'end' },
  { title: 'Status', key: 'active', align: 'center' },
  { title: 'Timeline', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row opacity-60 italic' } : {}
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value)
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
              color="info"
              variant="tonal"
              size="42"
              rounded="lg"
            >
              <VIcon size="24">
                tabler-wallet
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-black">Debtor Management</span>
              <span class="text-caption text-medium-emphasis">Audit customer credit limits and account health</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-user-plus"
            variant="elevated"
            @click="addDebtor"
          >
            Add Debtor
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="debtors"
          :loading="loading"
          item-key="debtor_uuid"
          class="flex-grow-1 debtor-table"
          :items-per-page="pagination.perPage"
          :row-props="getRowProps"
          hover
        >
          <template #item.debtor_name="{ item }">
            <div class="d-flex align-center ga-3 py-3">
              <VAvatar
                size="34"
                color="info"
                variant="tonal"
                class="border"
              >
                <span class="text-xs font-weight-bold">{{ item.debtor_name?.charAt(0) }}</span>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.debtor_name }}
                </span>
                <div class="d-flex align-center ga-1">
                  <VIcon
                    size="12"
                    color="medium-emphasis"
                  >
                    tabler-mail
                  </VIcon>
                  <span class="text-xxs text-disabled text-truncate font-mono">
                    {{ item.debtor_email || 'no-email-recorded' }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #item.debtor_type="{ item }">
            <VChip
              size="x-small"
              :color="item.debtor_type === 'Corporate' ? 'primary' : 'secondary'"
              variant="flat"
              label
              class="font-weight-black text-uppercase tracking-tighter"
            >
              {{ item.debtor_type }}
            </VChip>
          </template>

          <template #item.credit_limit="{ item }">
            <div class="d-flex flex-column align-end">
              <span class="font-weight-black font-mono text-body-2 text-primary">
                {{ formatCurrency(item.credit_limit) }}
              </span>
              <span class="text-xxs text-disabled font-weight-bold uppercase tracking-widest">Limit</span>
            </div>
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
                  tabler-user-off
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
                <VListSubheader class="text-xxs font-weight-black uppercase">
                  Account Actions
                </VListSubheader>

                <VListItem @click="editDebtor(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Details</VListItemTitle>
                </VListItem>

                <VListItem @click="copyUuid(item.debtor_uuid)">
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
                  @click="item.active === 1 ? deactivateDebtor(item) : activateDebtor(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-lock-pause' : 'tabler-lock-open' }}
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-medium">
                    {{ item.active === 1 ? 'Suspend Account' : 'Unsuspend Account' }}
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  color="success"
                  @click="restoreDebtor(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Restore Account
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  color="error"
                  @click="deleteDebtorModal(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-archive
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Archive Account
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4 bg-var-theme-surface">
              <div class="d-flex align-center ga-3">
                <span class="text-caption text-medium-emphasis font-weight-medium">Rows per page:</span>
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
                  @update:model-value="(page) => fetchAllDebtors(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <CreateDebtorModal
    v-model:model-value="openAdd"
    v-model:debtor="newDebtor"
    :loading="loading"
    @confirm="createDebtor"
  />
  <UpdateDebtorModal
    v-model:model-value="openEdit"
    v-model:debtor="debtorToEdit"
    :loading="loading"
    @confirm="updateDebtor"
  />
  <DeleteDebtorModal
    v-model:model-value="openDelete"
    v-model:debtor="debtorToDelete"
    :loading="loading"
    @confirm="deleteDebtor"
  />
</template>

<style scoped>
.debtor-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

.deleted-row {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.04) !important;
}

.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.tracking-widest { letter-spacing: 0.12em; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }
.opacity-60 { opacity: 0.6; }
</style>
