<script setup lang="ts">
import { useProduct } from '@/composables/products/useProduct'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  showToast,
  loading,
  products,
  pagination,
  fetchAllProducts,
  openAdd,
  addProduct,
  newProduct,
  createProduct,
  openEdit,
  productToEdit,
  editProduct,
  updateProduct,
  openDelete,
  productToDelete,
  deleteProductModal,
  deleteProduct,
  restoreProduct,
  activateProduct,
  deactivateProduct,
} = useProduct()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllProducts()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllProducts()
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
  { title: 'Product Name', key: 'product_name' },
  { title: 'Product Category', key: 'category_name' },
  { title: 'Product Brand', key: 'product_brand' },
  { title: 'Product Model Number', key: 'product_model_number' },
  { title: 'Default Price', key: 'default_price' },
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
          <span class="text-h6">Products Table</span>
          <VBtn
            color="primary"
            @click="addProduct"
          >
            Add Product
          </VBtn>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="products"
          :loading="loading"
          item-key="product_uuid"
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
                <VListItem @click="copyUuid(item.product_uuid)">
                  <VIcon>tabler-copy</VIcon>
                  <span class="ms-2">Copy UUID</span>
                </VListItem>
                <VDivider />

                <VListItem @click="editProduct(item)">
                  <VIcon>tabler-edit</VIcon>
                  <span class="ms-2">Edit Product</span>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreProduct(item)"
                >
                  <VIcon>tabler-restore</VIcon>
                  <span class="ms-2">Restore Product</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="deleteProductModal(item)"
                >
                  <VIcon>tabler-trash</VIcon>
                  <span class="ms-2">Delete Product</span>
                </VListItem>
                <VListItem
                  v-if="item.active === 1"
                  @click="deactivateProduct(item)"
                >
                  <VIcon>tabler-radio-off</VIcon>
                  <span class="ms-2">Deactivate Product</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="activateProduct(item)"
                >
                  <VIcon>tabler-radio</VIcon>
                  <span class="ms-2">Activate Product</span>
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
                @update:model-value="(page: number) => fetchAllProducts(page)"
              />
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
