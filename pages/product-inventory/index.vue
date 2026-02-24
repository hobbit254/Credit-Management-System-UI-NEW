<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useProductInventory } from '@/composables/product-inventory/useProductInventory'

const {
  loading, showToast, productInventories, fetchAllProductInventory, pagination,
  openAdd, newProductInventory, addProductInventory, createProductInventory,
  editProductInventory, openEdit, productInventoryToEdit, updateProductInventory,
  deleteProductInventory, deleteProductInventoryModal, openDelete,
  productInventoryToDelete, restoreProductInventory, importProductInventoryCsv,
} = useProductInventory()

// --- State ---
const isImportModalOpen = ref(false)
const csvFile = ref<File | null>(null)

const perPageOptions = [
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: -1, title: 'All' },
]

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)
const errorColor = computed(() => theme.current.value.colors.error)

const statusColorMap: Record<string, string> = {
  InStock: 'success',
  Returned: 'warning',
  ReturnedToSupplier: 'info',
  OnCredit: 'warning',
  Paid: 'success',
  Sold: 'secondary',
}

const statusIconMap: Record<string, string> = {
  InStock: 'tabler-circle-check',
  Returned: 'tabler-arrow-back-up',
  ReturnedToSupplier: 'tabler-arrow-forward-up',
  OnCredit: 'tabler-clock',
  Paid: 'tabler-circle-check',
  Sold: 'tabler-shopping-cart',
}

const headers = [
  { title: 'Item Identity', key: 'product_name', fixed: true },
  { title: 'Source / Supplier', key: 'supplier_name' },
  { title: 'Valuation', key: 'default_price', align: 'end' },
  { title: 'Stock Health', key: 'status', align: 'center' },
  { title: 'Lifecycle', key: 'updated_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

// --- Methods ---

const refreshData = async () => {
  // Ensure we refresh using current pagination state
  await fetchAllProductInventory({
    page: pagination.value.currentPage,
    perPage: pagination.value.perPage,
  })
}

const handleCsvUpload = async () => {
  if (!csvFile.value)
    return

  await importProductInventoryCsv(csvFile.value)

  // Close modal and reset file on success
  isImportModalOpen.value = false
  csvFile.value = null
}

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1

  // Pass the explicit values to the API call
  fetchAllProductInventory({
    page: 1,
    perPage: value,
  })
}

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row-style italic opacity-75' } : {}
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'Inventory ID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

// --- Lifecycle ---
onMounted(async () => {
  await refreshData()
})
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1 border">
        <VCardTitle class="d-flex justify-space-between align-center pa-4 text-wrap ga-4">
          <div class="d-flex align-center ga-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="40"
            >
              <VIcon>tabler-building-warehouse</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Stock Management</span>
              <span class="text-caption text-medium-emphasis">Track serialized units, suppliers, and sales status</span>
            </div>
          </div>

          <div class="d-flex align-center ga-2">
            <VBtn
              color="primary"
              variant="tonal"
              prepend-icon="tabler-refresh"
              :loading="loading"
              @click="refreshData"
            >
              Refresh Page
            </VBtn>

            <VBtn
              color="secondary"
              variant="tonal"
              prepend-icon="tabler-file-upload"
              @click="isImportModalOpen = true"
            >
              Import CSV
            </VBtn>

            <VBtn
              color="primary"
              prepend-icon="tabler-barcode"
              variant="elevated"
              @click="addProductInventory"
            >
              Add Inventory
            </VBtn>
          </div>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="productInventories"
          :loading="loading"
          item-key="inventory_uuid"
          class="flex-grow-1 inventory-table"
          :items-per-page="pagination.perPage"
          :row-props="getRowProps"
          hover
        >
          <template #item.product_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.product_name }}
                </span>
                <div class="d-flex align-center ga-2 mt-1">
                  <VChip
                    size="x-small"
                    variant="flat"
                    color="secondary"
                    class="font-weight-bold"
                  >
                    SN: {{ item.serial_number || 'N/A' }}
                  </VChip>
                  <span class="text-xxs text-disabled text-truncate">{{ item.category_name }}</span>
                </div>
              </div>
            </div>
          </template>

          <template #item.supplier_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="26"
                color="warning"
                variant="tonal"
              >
                <span class="text-xxs font-weight-bold">{{ item.supplier_name?.charAt(0) }}</span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-caption font-weight-medium text-high-emphasis">{{ item.supplier_name }}</span>
                <span class="text-xxs text-disabled">{{ item.supplier_shop_name }}</span>
              </div>
            </div>
          </template>

          <template #item.default_price="{ item }">
            <div class="d-flex flex-column align-end">
              <span class="text-body-2 font-weight-bold font-mono">
                {{ item.default_price ? Number(item.default_price).toLocaleString() : '0.00' }}
              </span>
              <span class="text-xxs text-disabled font-weight-bold uppercase">KSH</span>
            </div>
          </template>

          <template #item.status="{ item }">
            <div class="d-flex flex-column align-center ga-1">
              <VChip
                :color="statusColorMap[item.status] ?? 'secondary'"
                size="x-small"
                variant="flat"
                class="font-weight-bold"
              >
                <template #prepend>
                  <VIcon
                    size="12"
                    start
                  >
                    {{ statusIconMap[item.status] ?? 'tabler-circle' }}
                  </VIcon>
                </template>
                {{ item.status }}
              </VChip>
              <div class="d-flex align-center ga-1">
                <StatusBadge :active="item.active" />
                <VIcon
                  v-if="item.product_active_status === 0"
                  size="12"
                  color="error"
                  icon="tabler-alert-triangle"
                />
              </div>
            </div>
          </template>

          <template #item.updated_at="{ item }">
            <div class="d-flex flex-column ga-1 text-xxs text-medium-emphasis">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-clock-play
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
                <VListItem @click="copyUuid(item.inventory_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-fingerprint
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>
                <VDivider class="my-1" />
                <VListItem @click="editProductInventory(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Adjust Stock</VListItemTitle>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  color="success"
                  @click="restoreProductInventory(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle>Restore Item</VListItemTitle>
                </VListItem>
                <VListItem
                  v-else
                  color="error"
                  @click="deleteProductInventoryModal(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-archive
                    </VIcon>
                  </template>
                  <VListItemTitle>Remove Item</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4 bg-var-theme-surface">
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
                  @update:model-value="(page: number) => fetchAllProductInventory({ page })"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <CreateProductInventory
    v-model:model-value="openAdd"
    v-model:product-inventory="newProductInventory"
    :loading="loading"
    @confirm="createProductInventory"
  />
  <UpdateProductInventory
    v-model:model-value="openEdit"
    v-model:product-inventory="productInventoryToEdit"
    :loading="loading"
    @confirm="updateProductInventory"
  />
  <DeleteProductInventory
    v-model:model-value="openDelete"
    v-model:product-inventory="productInventoryToDelete"
    :loading="loading"
    @confirm="deleteProductInventory"
  />

  <VDialog
    v-model="isImportModalOpen"
    max-width="500"
  >
    <VCard>
      <VCardTitle class="pa-4 d-flex align-center">
        <VIcon
          start
          color="secondary"
        >
          tabler-file-spreadsheet
        </VIcon>
        Bulk Import Inventory
      </VCardTitle>
      <VCardText>
        <div class="text-body-2 mb-4">
          Select a CSV file to upload. Ensure columns match the required inventory format.
        </div>
        <VFileInput
          v-model="csvFile"
          label="Select CSV File"
          accept=".csv"
          prepend-icon="tabler-upload"
          variant="outlined"
          density="compact"
          :loading="loading"
          show-size
        />
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="text"
          :disabled="loading"
          @click="isImportModalOpen = false"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!csvFile"
          :loading="loading"
          @click="handleCsvUpload"
        >
          Upload Data
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.inventory-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep(.deleted-row-style) td {
  background-color: v-bind(`${errorColor}1F`) !important;
}

.text-xxs {
  font-size: 0.65rem;
}

.font-mono {
  font-family: 'Fira Code', monospace;
}
</style>
