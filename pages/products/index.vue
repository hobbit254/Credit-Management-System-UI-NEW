<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useProduct } from '@/composables/products/useProduct'

const {
  showToast, loading, products, pagination, fetchAllProducts,
  openAdd, addProduct, newProduct, createProduct,
  openEdit, productToEdit, editProduct, updateProduct,
  openDelete, productToDelete, deleteProductModal, deleteProduct,
  restoreProduct, activateProduct, deactivateProduct,
} = useProduct()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)
const errorColor = computed(() => theme.current.value.colors.error)

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllProducts()
  }
  finally {
    loading.value = false
  }
})

const perPageOptions = [5, 10, 25, 50, 100]

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllProducts()
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'Product UUID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Product Identity', key: 'product_name', fixed: true },
  { title: 'Category', key: 'category_name' },
  { title: 'Price (KES)', key: 'default_price', align: 'end' },
  { title: 'Status', key: 'active', align: 'center' },
  { title: 'Last Activity', key: 'updated_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row-style italic' } : {}
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
              color="primary"
              variant="tonal"
              size="40"
            >
              <VIcon>tabler-package</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Product Catalog</span>
              <span class="text-caption text-medium-emphasis">Manage stock items, pricing, and classifications</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            variant="elevated"
            @click="addProduct"
          >
            Add Product
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="products"
          :loading="loading"
          item-key="product_uuid"
          class="flex-grow-1 product-table"
          :items-per-page="-1"
          :row-props="getRowProps"
          hover
        >
          <template #item.product_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VAvatar
                size="38"
                color="primary"
                variant="tonal"
                rounded="lg"
              >
                <VIcon size="20">
                  tabler-box
                </VIcon>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.product_name }}
                </span>
                <div class="d-flex align-center ga-1 mt-1">
                  <VChip
                    v-if="item.product_brand"
                    size="x-small"
                    variant="outlined"
                    class="text-xxs"
                  >
                    {{ item.product_brand }}
                  </VChip>
                  <span class="text-xxs text-disabled font-mono">
                    {{ item.product_model_number || item.product_uuid.split('-')[0] }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #item.category_name="{ item }">
            <VChip
              v-if="item.category_name"
              size="x-small"
              color="info"
              variant="tonal"
              label
              class="font-weight-bold"
            >
              {{ item.category_name }}
            </VChip>
            <span
              v-else
              class="text-caption text-disabled italic"
            >Uncategorized</span>
          </template>

          <template #item.default_price="{ item }">
            <span class="font-weight-bold font-mono text-body-2 text-high-emphasis">
              {{ item.default_price ? Number(item.default_price).toLocaleString() : '0.00' }}
            </span>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.updated_at="{ item }">
            <div class="d-flex flex-column ga-1 text-xxs text-medium-emphasis">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-history
                </VIcon>
                <TableDate :value="item.updated_at" />
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
                <VListSubheader class="text-xxs font-weight-black uppercase">
                  Inventory Actions
                </VListSubheader>

                <VListItem @click="editProduct(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Details</VListItemTitle>
                </VListItem>

                <VListItem @click="copyUuid(item.product_uuid)">
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
                  @click="item.active === 1 ? deactivateProduct(item) : activateProduct(item)"
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
                  @click="restoreProduct(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Restore Product
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  color="error"
                  @click="deleteProductModal(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-archive
                    </VIcon>
                  </template>
                  <VListItemTitle class="font-weight-bold">
                    Archive Product
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10 ga-2">
              <VIcon
                size="48"
                color="secondary"
                class="opacity-50"
              >
                tabler-package-off
              </VIcon>
              <span class="text-body-1 text-medium-emphasis font-weight-medium">Your catalog is empty</span>
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
                @click="addProduct"
              >
                Add your first product
              </VBtn>
            </div>
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
                  @update:model-value="(page: number) => fetchAllProducts(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <CreateProductModal
    v-model:model-value="openAdd"
    v-model:product="newProduct"
    :loading="loading"
    @confirm="createProduct"
  />
  <UpdateProductModal
    v-model:model-value="openEdit"
    v-model:product="productToEdit"
    :loading="loading"
    @confirm="updateProduct"
  />
  <DeleteProductModal
    v-model:model-value="openDelete"
    v-model:product="productToDelete"
    :loading="loading"
    @confirm="deleteProduct"
  />
</template>

<style scoped>
.product-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep(.deleted-row-style) td {
  background-color: v-bind(`${errorColor}1F`) !important; /* ~12% opacity error color */
}

.text-xxs {
  font-size: 0.65rem;
}

.italic {
  font-style: italic;
}
</style>
