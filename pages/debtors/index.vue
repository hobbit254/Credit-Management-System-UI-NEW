<script setup lang="ts">
import { useDebtor } from '@/composables/debtors/useDebtor'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  debtors,
  loading,
  pagination,
  showToast,
  fetchAllDebtors,
  openAdd,
  newDebtor,
  addDebtor,
  createDebtor,
  openEdit,
  debtorToEdit,
  editDebtor,
  updateDebtor,
  openDelete,
  deleteDebtorModal,
  debtorToDelete,
  deleteDebtor,
  restoreDebtor,
  activateDebtor,
  deactivateDebtor,
} = useDebtor()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllDebtors()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllDebtors()
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
  { title: 'Debtor Name', key: 'debtor_name' },
  { title: 'Debtor Email', key: 'debtor_email' },
  { title: 'Debtor Phone', key: 'debtor_phone' },
  { title: 'Debtor Type', key: 'debtor_type' },
  { title: 'Credit Limit', key: 'credit_limit' },
  { title: 'Active', key: 'active' },
  { title: 'Created', key: 'created_at' },
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
          <span class="text-h6">Debtors Table</span>
          <VBtn
            color="primary"
            @click="addDebtor"
          >
            Add Debtor
          </VBtn>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="debtors"
          :loading="loading"
          item-key="debtor_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
        >
          <!-- Status Badge -->
          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <!-- Dates -->
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
                <VListItem @click="copyUuid(item.debtor_uuid)">
                  <VIcon>tabler-copy</VIcon>
                  <span class="ms-2">Copy UUID</span>
                </VListItem>
                <VDivider />

                <VListItem @click="editDebtor(item)">
                  <VIcon>tabler-edit</VIcon>
                  <span class="ms-2">Edit Debtor</span>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreDebtor(item)"
                >
                  <VIcon>tabler-restore</VIcon>
                  <span class="ms-2">Restore Debtor</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="deleteDebtorModal(item)"
                >
                  <VIcon>tabler-trash</VIcon>
                  <span class="ms-2">Delete Debtor</span>
                </VListItem>
                <VListItem
                  v-if="item.active === 1"
                  @click="deactivateDebtor(item)"
                >
                  <VIcon>tabler-radio-off</VIcon>
                  <span class="ms-2">Deactivate Debtor</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="activateDebtor(item)"
                >
                  <VIcon>tabler-radio</VIcon>
                  <span class="ms-2">Activate Debtor</span>
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
                @update:model-value="(page: number) => fetchAllDebtors(page)"
              />
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
