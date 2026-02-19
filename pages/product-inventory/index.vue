<script setup lang="ts">
import { useProductInventory } from '@/composables/product-inventory/useProductInventory'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  loading,
  showToast,
  productInventories,
  fetchAllProductInventory,
  pagination,
  openAdd,
  newProductInventory,
  addProductInventory,
  createProductInventory,
  editProductInventory,
  openEdit,
  productInventoryToEdit,
  updateProductInventory,
  deleteProductInventory,
  deleteProductInventoryModal,
  openDelete,
  productInventoryToDelete,
  restoreProductInventory,
} = useProductInventory()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllProductInventory()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllProductInventory()
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
  { title: 'Product', key: 'product_name' },
  { title: 'Serial Number', key: 'serial_number' },
  { title: 'Category', key: 'category_name' },
  { title: 'Supplier', key: 'supplier_name' },
  { title: 'Default Price', key: 'default_price' },
  { title: 'Status', key: 'status' },
  { title: 'Active', key: 'active' },
  { title: 'Product Active Status', key: 'product_active_status' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },
  { title: 'Deleted', key: 'deleted_at' },
  { title: 'Actions', key: 'actions' },
]

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row' } : {}
}
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-2">
            <VIcon color="primary">
              tabler-package
            </VIcon>
            <span class="text-h6 font-weight-bold">Product Inventory</span>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="addProductInventory"
          >
            Add Inventory
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="productInventories"
          :loading="loading"
          item-key="inventory_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
          :row-props="getRowProps"
        >
          <!-- Product -->
          <template #item.product_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.product_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-body-2">{{ item.product_name ?? '—' }}</span>
                <div class="d-flex align-center ga-1 mt-1">
                  <VChip
                    v-if="item.product_brand"
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                  >
                    {{ item.product_brand }}
                  </VChip>
                  <VChip
                    v-if="item.product_model_number"
                    size="x-small"
                    color="info"
                    variant="tonal"
                  >
                    {{ item.product_model_number }}
                  </VChip>
                </div>
              </div>
            </div>
          </template>

          <!-- Serial Number -->
          <template #item.serial_number="{ item }">
            <VChip
              size="small"
              variant="outlined"
              color="secondary"
            >
              <VIcon
                start
                size="12"
              >
                tabler-hash
              </VIcon>
              {{ item.serial_number ?? '—' }}
            </VChip>
          </template>

          <!-- Category -->
          <template #item.category_name="{ item }">
            <VChip
              size="small"
              color="info"
              variant="tonal"
            >
              <VIcon
                start
                size="12"
              >
                tabler-tag
              </VIcon>
              {{ item.category_name ?? '—' }}
            </VChip>
          </template>

          <!-- Supplier -->
          <template #item.supplier_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="28"
                color="warning"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.supplier_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="text-body-2">{{ item.supplier_name ?? '—' }}</span>
                <span
                  v-if="item.supplier_shop_name"
                  class="text-caption text-medium-emphasis"
                >
                  {{ item.supplier_shop_name }}
                </span>
              </div>
            </div>
          </template>

          <!-- Default Price -->
          <template #item.default_price="{ item }">
            <div class="d-flex align-center ga-1">
              <span class="text-caption font-weight-bold text-success">KSH</span>
              <span class="font-weight-medium text-body-2">
                {{ item.default_price ? Number(item.default_price).toLocaleString() : '—' }}
              </span>
            </div>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <VChip
              :color="statusColorMap[item.status] ?? 'secondary'"
              size="small"
              variant="tonal"
            >
              <VIcon
                start
                size="13"
              >
                {{ statusIconMap[item.status] ?? 'tabler-circle' }}
              </VIcon>
              {{ item.status ?? '—' }}
            </VChip>
          </template>

          <!-- Active -->
          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.product_active_status="{ item }">
            <StatusBadge :active="item.product_active_status" />
          </template>

          <!-- Dates -->
          <template #item.created_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">
                tabler-calendar
              </VIcon>
              <TableDate :value="item.created_at" />
            </div>
          </template>

          <template #item.updated_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">
                tabler-clock-edit
              </VIcon>
              <TableDate :value="item.updated_at" />
            </div>
          </template>

          <template #item.deleted_at="{ item }">
            <div
              v-if="item.deleted_at"
              class="d-flex align-center ga-1 text-caption text-error"
            >
              <VIcon
                size="13"
                color="error"
              >
                tabler-trash
              </VIcon>
              <TableDate :value="item.deleted_at" />
            </div>
            <span
              v-else
              class="text-medium-emphasis"
            >—</span>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <VMenu>
              <template #activator="{ props }">
                <VBtn
                  icon="tabler-dots"
                  variant="text"
                  size="small"
                  v-bind="props"
                />
              </template>
              <VList density="compact">
                <VListSubheader>Actions</VListSubheader>

                <VListItem @click="copyUuid(item.inventory_uuid)">
                  <div class="d-flex align-center ga-2">
                    <VIcon size="16">
                      tabler-copy
                    </VIcon>
                    <span>Copy UUID</span>
                  </div>
                </VListItem>

                <VDivider />

                <VListItem @click="editProductInventory(item)">
                  <div class="d-flex align-center ga-2">
                    <VIcon size="16">
                      tabler-edit
                    </VIcon>
                    <span>Edit Inventory</span>
                  </div>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreProductInventory(item)"
                >
                  <div class="d-flex align-center ga-2">
                    <VIcon
                      size="16"
                      color="success"
                    >
                      tabler-restore
                    </VIcon>
                    <span class="text-success">Restore Inventory</span>
                  </div>
                </VListItem>

                <VListItem
                  v-else
                  @click="deleteProductInventoryModal(item)"
                >
                  <div class="d-flex align-center ga-2">
                    <VIcon
                      size="16"
                      color="error"
                    >
                      tabler-trash
                    </VIcon>
                    <span class="text-error">Delete Inventory</span>
                  </div>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <!-- No data -->
          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-6 ga-2">
              <VIcon
                size="40"
                color="secondary"
              >
                tabler-package-off
              </VIcon>
              <span class="text-body-2 text-medium-emphasis">No product inventory found.</span>
            </div>
          </template>

          <!-- Bottom Pagination Slot -->
          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4">
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
              <span class="text-medium-emphasis text-sm">
                Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
              </span>
              <VPagination
                v-model="pagination.currentPage"
                :length="pagination.lastPage"
                @update:model-value="(page: number) => fetchAllProductInventory(page)"
              />
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <LazyCreateProductInventory
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
</template>

<style scoped>
:deep(.deleted-row) td {
  background-color: rgba(255, 82, 82, 0.12) !important;
}

:deep(.deleted-row:hover) td {
  background-color: rgba(255, 82, 82, 0.22) !important;
}

:deep(.v-data-table__tr:hover) td {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
