<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useProduct } from '@/composables/products/useProduct'
import { kes } from '@/utils/formatters'
import { copyId } from '@/utils/clipboard'

definePageMeta({
  subject: 'v1/products',
})

const {
  loading, products, pagination, filters, fetchAllProducts,
  openAdd, addProduct, newProduct, createProduct,
  openEdit, productToEdit, editProduct, updateProduct,
  openDelete, productToDelete, deleteProductModal, deleteProduct,
  restoreProduct, activateProduct, deactivateProduct, importProductsCsv,
} = useProduct()

onMounted(() => fetchAllProducts())

// A new search starts again from page 1.
watchDebounced(() => filters.value.search, () => fetchAllProducts({ page: 1 }), { debounce: 300 })

// Same threshold as the overview's stock table.
function stockText(count: number) {
  if (count === 0)
    return 'Out of stock'

  return count <= 2 ? `${count} left` : String(count)
}

const isImportOpen = ref(false)

async function importCsv(file: File) {
  if (await importProductsCsv(file))
    isImportOpen.value = false
}
</script>

<template>
  <ListPage
    title="Products"
    :subtitle="`${pagination.total} ${pagination.total === 1 ? 'model' : 'models'} you stock`"
    :loading="loading"
    :pagination="pagination"
    :row-count="products.length"
    :columns="5"
    :empty-text="filters.search ? 'No products match. Try another name, model or brand.' : 'No products yet. Add the models you sell, then add devices for each.'"
    @page="page => fetchAllProducts({ page })"
  >
    <template #actions>
      <VBtn
        variant="outlined"
        color="default"
        prepend-icon="tabler-file-upload"
        @click="isImportOpen = true"
      >
        Import CSV
      </VBtn>
      <VBtn
        prepend-icon="tabler-plus"
        @click="addProduct"
      >
        Add product
      </VBtn>
    </template>

    <template #filters>
      <AppTextField
        v-model="filters.search"
        aria-label="Search products"
        placeholder="Name, model or brand"
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 360px; min-inline-size: 220px;"
      />
    </template>

    <template #head>
      <th>Product</th>
      <th>Category</th>
      <th class="text-end">
        Price
      </th>
      <th class="text-end">
        In stock
      </th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="product in products"
      :key="product.product_uuid"
      :class="{ archived: product.deleted_at }"
    >
      <td class="py-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="font-weight-medium text-body-1">{{ product.product_name }}</span>
          <VChip
            v-if="product.deleted_at"
            color="error"
            size="small"
          >
            Archived
          </VChip>
          <VChip
            v-else-if="!product.active"
            color="warning"
            size="small"
          >
            Switched off
          </VChip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ product.product_brand }} {{ product.product_model_number }}
        </div>
      </td>
      <td class="text-body-1">
        {{ product.category_name }}
      </td>
      <td class="text-end text-body-1">
        {{ kes(product.default_price) }}
      </td>
      <td
        class="text-end text-body-1"
        :class="{ 'text-error font-weight-bold': Number(product.inventory_total ?? 0) <= 2 }"
      >
        {{ stockText(Number(product.inventory_total ?? 0)) }}
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${product.product_name}`"
              icon="tabler-dots-vertical"
              variant="text"
              color="default"
              v-bind="menuProps"
            />
          </template>
          <VList>
            <VListItem
              prepend-icon="tabler-edit"
              title="Edit"
              @click="editProduct(product)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(product.product_uuid, 'Product')"
            />
            <!-- Archived rows are restored, not switched on -->
            <template v-if="!product.deleted_at">
              <VDivider class="my-1" />
              <VListItem
                :prepend-icon="product.active ? 'tabler-lock-pause' : 'tabler-lock-open'"
                :title="product.active ? 'Switch off' : 'Switch on'"
                @click="product.active ? deactivateProduct(product) : activateProduct(product)"
              />
              <VListItem
                prepend-icon="tabler-archive"
                title="Archive"
                base-color="error"
                @click="deleteProductModal(product)"
              />
            </template>
            <VListItem
              v-else
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restoreProduct(product)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

  <CsvImportDialog
    v-model="isImportOpen"
    title="Import products"
    hint="Upload a CSV with one product per row, in the same columns as the import template."
    :loading="loading"
    @upload="importCsv"
  />
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
