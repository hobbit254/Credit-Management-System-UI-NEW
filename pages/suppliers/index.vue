<script setup lang="ts">
import { useSuppliers } from '@/composables/suppliers/useSuppliers'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  showToast,
  suppliers,
  loading,
  pagination,
  fetchAllSuppliers,
  newSupplier,
  openAdd,
  addSupplier,
  createSupplier,
  openEdit,
  supplierToEdit,
  editSupplier,
  updateSupplier,
  deactivateSupplier,
  activateSupplier,
  restoreSupplier,
  openDelete,
  supplierToDelete,
  deleteSupplierModal,
  deleteSupplier,
} = useSuppliers()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllSuppliers()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllSuppliers()
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
  { title: 'Supplier Name', key: 'supplier_name' },
  { title: 'Supplier Shop Name', key: 'supplier_shop_name' },
  { title: 'Supplier Phone Number', key: 'supplier_phone' },
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
          <span class="text-h6">Suppliers Table</span>
          <VBtn
            color="primary"
            @click="addSupplier"
          >
            Add Supplier
          </VBtn>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="suppliers"
          :loading="loading"
          item-key="supplier_uuid"
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
                <VListItem @click="copyUuid(item.supplier_uuid)">
                  <VIcon>tabler-copy</VIcon>
                  <span class="ms-2">Copy UUID</span>
                </VListItem>
                <VDivider />

                <VListItem @click="editSupplier(item)">
                  <VIcon>tabler-edit</VIcon>
                  <span class="ms-2">Edit Supplier</span>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreSupplier(item)"
                >
                  <VIcon>tabler-restore</VIcon>
                  <span class="ms-2">Restore Supplier</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="deleteSupplierModal(item)"
                >
                  <VIcon>tabler-trash</VIcon>
                  <span class="ms-2">Delete Supplier</span>
                </VListItem>
                <VListItem
                  v-if="item.active === 1"
                  @click="deactivateSupplier(item)"
                >
                  <VIcon>tabler-radio-off</VIcon>
                  <span class="ms-2">Deactivate Supplier</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="activateSupplier(item)"
                >
                  <VIcon>tabler-radio</VIcon>
                  <span class="ms-2">Activate Supplier</span>
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
                @update:model-value="(page: number) => fetchAllSuppliers(page)"
              />
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>
  <CreateSupplierModal
    v-model:model-value="openAdd"
    v-model:supplier="newSupplier"
    :loading="loading"
    @confirm="createSupplier"
  />
  <UpdateSupplierModal
    v-model:model-value="openEdit"
    v-model:supplier="supplierToEdit"
    :loading="loading"
    @confirm="updateSupplier"
  />
  <DeleteSupplierModal
    v-model:model-value="openDelete"
    v-model:supplier="supplierToDelete"
    :loading="loading"
    @confirm="deleteSupplier"
  />
</template>
