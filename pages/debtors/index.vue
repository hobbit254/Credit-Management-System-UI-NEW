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
const errorColor = computed(() => theme.current.value.colors.error)

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
    text: 'Debtor UUID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Debtor Identity', key: 'debtor_name', fixed: true },
  { title: 'Type', key: 'debtor_type' },
  { title: 'Credit Limit', key: 'credit_limit', align: 'end' },
  { title: 'Status', key: 'active', align: 'center' },
  { title: 'Timeline', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row-style text-error italic' } : {}
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KSH' }).format(value)
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
              color="info"
              variant="tonal"
              size="40"
            >
              <VIcon>tabler-wallet</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Debtor Management</span>
              <span class="text-caption text-medium-emphasis">Manage customer credit and payment profiles</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-user-plus"
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
          :items-per-page="-1"
          :row-props="getRowProps"
          hover
        >
          <template #item.debtor_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VAvatar
                size="38"
                color="info"
                variant="tonal"
              >
                <VIcon size="20">
                  tabler-user-dollar
                </VIcon>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.debtor_name }}
                </span>
                <span class="text-xxs text-medium-emphasis">
                  {{ item.debtor_email || 'No Email' }}
                </span>
              </div>
            </div>
          </template>

          <template #item.debtor_type="{ item }">
            <VChip
              size="x-small"
              :color="item.debtor_type === 'Corporate' ? 'primary' : 'secondary'"
              variant="flat"
              class="font-weight-bold text-uppercase"
            >
              {{ item.debtor_type }}
            </VChip>
          </template>

          <template #item.credit_limit="{ item }">
            <span class="font-weight-bold font-mono text-body-2">
              {{ formatCurrency(item.credit_limit) }}
            </span>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex flex-column ga-1 text-xxs text-medium-emphasis">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-clock-plus
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
                  icon="tabler-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="activatorProps"
                />
              </template>
              <VList density="compact">
                <VListSubheader>Debtor Actions</VListSubheader>
                <VListItem @click="copyUuid(item.debtor_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-copy
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>
                <VDivider class="my-1" />
                <VListItem @click="editDebtor(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Profile</VListItemTitle>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreDebtor(item)"
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
                    Restore Debtor
                  </VListItemTitle>
                </VListItem>
                <VListItem
                  v-else
                  @click="deleteDebtorModal(item)"
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
                    Remove Debtor
                  </VListItemTitle>
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
                  <VListItemTitle>{{ item.active === 1 ? 'Suspend Credit' : 'Unsuspend' }}</VListItemTitle>
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
                  @update:model-value="(page: number) => fetchAllDebtors(page)"
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
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep(.deleted-row-style) td {
  background-color: v-bind(`${errorColor}1F`) !important; /* Adding 1F hex for ~12% opacity */
}

.text-xxs {
  font-size: 0.65rem;
}

.italic {
  font-style: italic;
}
</style>
