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

const perPageOptions = [5, 10, 25, 50, 100]

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
    text: 'Supplier UUID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

// Strictly Typed Headers
const headers = [
  { title: 'Partner Identity', key: 'supplier_name', fixed: true },
  { title: 'Contact Details', key: 'supplier_phone' },
  { title: 'Status', key: 'active', width: '120px' },
  { title: 'Partnership Timeline', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

function getRowProps({ item }: { item: any }) {
  // Visual cue for archived partners
  return item.deleted_at !== null ? { class: 'opacity-60 bg-var-theme-background italic' } : {}
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
              color="secondary"
              variant="tonal"
              size="42"
              rounded="lg"
            >
              <VIcon size="24">
                tabler-building-store
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Supplier Directory</span>
              <span class="text-caption text-medium-emphasis">Procurement partners and inventory vendors</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            variant="elevated"
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
          :items-per-page="pagination.perPage"
          :row-props="getRowProps"
          hover
        >
          <template #item.supplier_name="{ item }">
            <div class="d-flex align-center ga-3 py-3">
              <VAvatar
                size="34"
                color="secondary"
                variant="tonal"
                class="border"
              >
                <span class="text-xs font-weight-bold">{{ item.supplier_name?.charAt(0) }}</span>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.supplier_name }}
                </span>
                <div class="d-flex align-center ga-1">
                  <VIcon
                    size="12"
                    color="primary"
                  >
                    tabler-building-warehouse
                  </VIcon>
                  <span class="text-xxs text-medium-emphasis font-weight-medium text-truncate">
                    {{ item.supplier_shop_name }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #item.supplier_phone="{ item }">
            <div class="d-flex align-center ga-2">
              <VBtn
                v-if="item.supplier_phone"
                variant="tonal"
                size="x-small"
                color="primary"
                rounded="pill"
                icon="tabler-phone"
                class="me-1"
                :href="`tel:${item.supplier_phone}`"
              />
              <span class="text-body-2 font-mono">{{ item.supplier_phone || '—' }}</span>
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
                  tabler-trash-x
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
                <VListSubheader class="text-xxs uppercase font-weight-black">
                  Partner Options
                </VListSubheader>

                <VListItem @click="editSupplier(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Details</VListItemTitle>
                </VListItem>

                <VListItem @click="copyUuid(item.supplier_uuid)">
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
                  @click="item.active === 1 ? deactivateSupplier(item) : activateSupplier(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-lock-pause' : 'tabler-lock-open' }}
                    </VIcon>
                  </template>
                  <VListItemTitle>{{ item.active === 1 ? 'Suspend Account' : 'Unsuspend Account' }}</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  color="success"
                  @click="restoreSupplier(item)"
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
                  @click="deleteSupplierModal(item)"
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
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }
.opacity-60 { opacity: 0.6; }
</style>
