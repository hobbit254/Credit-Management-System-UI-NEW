<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useSuppliers } from '@/composables/suppliers/useSuppliers'

const {
  showToast, suppliers, loading, pagination, fetchAllSuppliers,
  newSupplier, openAdd, addSupplier, createSupplier,
  openEdit, supplierToEdit, editSupplier, updateSupplier,
  deactivateSupplier, activateSupplier, restoreSupplier,
  openDelete, supplierToDelete, deleteSupplierModal, deleteSupplier,
} = useSuppliers()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllSuppliers()
  }
  finally {
    loading.value = false
  }
})

const perPageOptions = [5, 10, 25, 50, 100]

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllSuppliers()
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'Supplier UUID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Partner Identity', key: 'supplier_name', fixed: true },
  { title: 'Phone Number', key: 'supplier_phone' },
  { title: 'Status', key: 'active' },
  { title: 'Timeline', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

function getRowProps({ item }: { item: any }) {
  // Safe utility-based styling for deleted items
  return item.deleted_at !== null ? { class: 'bg-error-lighten-5 italic text-error' } : {}
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
              color="secondary"
              variant="tonal"
              size="40"
            >
              <VIcon>tabler-building-store</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Suppliers</span>
              <span class="text-caption text-medium-emphasis">Manage procurement partners and vendors</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="addSupplier"
          >
            Add Supplier
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="suppliers"
          :loading="loading"
          item-key="supplier_uuid"
          class="flex-grow-1 supplier-table"
          :items-per-page="-1"
          :row-props="getRowProps"
          hover
        >
          <template #item.supplier_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VAvatar
                size="38"
                color="secondary"
                variant="tonal"
              >
                <VIcon size="20">
                  tabler-briefcase
                </VIcon>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.supplier_name }}
                </span>
                <span class="text-xxs text-primary font-weight-medium">
                  {{ item.supplier_shop_name }}
                </span>
              </div>
            </div>
          </template>

          <template #item.supplier_phone="{ item }">
            <div class="d-flex align-center ga-2">
              <VIcon
                size="14"
                class="text-medium-emphasis"
              >
                tabler-phone
              </VIcon>
              <span class="text-body-2">{{ item.supplier_phone || 'N/A' }}</span>
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
                <VListSubheader>Supplier Actions</VListSubheader>

                <VListItem @click="copyUuid(item.supplier_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-copy
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem @click="editSupplier(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Details</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreSupplier(item)"
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
                    Restore Partner
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  @click="deleteSupplierModal(item)"
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
                    Archive Partner
                  </VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivateSupplier(item) : activateSupplier(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-circle-off' : 'tabler-circle-check' }}
                    </VIcon>
                  </template>
                  <VListItemTitle>{{ item.active === 1 ? 'Deactivate' : 'Activate' }}</VListItemTitle>
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
                  @update:model-value="(page: number) => fetchAllSuppliers(page)"
                />
              </div>
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

<style scoped>
.supplier-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.text-xxs {
  font-size: 0.65rem;
}

.italic {
  font-style: italic;
}
</style>
