<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useProductInventory } from '@/composables/product-inventory/useProductInventory'
import { kes } from '@/utils/formatters'
import { copyId } from '@/utils/clipboard'

definePageMeta({
  subject: 'v1/product-inventory',
})

const {
  loading, productInventories, fetchAllProductInventory, pagination, filters,
  openAdd, newProductInventory, addProductInventory, createProductInventory,
  editProductInventory, openEdit, productInventoryToEdit, updateProductInventory,
  deleteProductInventory, deleteProductInventoryModal, openDelete,
  productInventoryToDelete, restoreProductInventory, importProductInventoryCsv,
} = useProductInventory()

onMounted(() => fetchAllProductInventory())

// A new search or filter starts again from page 1.
watchDebounced(() => filters.value.search, () => fetchAllProductInventory({ page: 1 }), { debounce: 300 })
watch(() => filters.value.status, () => fetchAllProductInventory({ page: 1 }))

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'InStock', label: 'In stock' },
  { value: 'OnCredit', label: 'On credit' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Returned', label: 'Returned' },
]

const statusLabel: Record<string, { text: string; color: string }> = {
  InStock: { text: 'In stock', color: 'success' },
  OnCredit: { text: 'On credit', color: 'info' },
  OnSale: { text: 'On a sale', color: 'info' },
  Paid: { text: 'Paid', color: 'success' },
  Sold: { text: 'Sold', color: 'default' },
  Returned: { text: 'Returned, needs checking', color: 'warning' },
  ReturnedToSupplier: { text: 'Back with supplier', color: 'default' },
}

const subtitle = computed(() => {
  const label = statusOptions.find(o => o.value === filters.value.status)?.label.toLowerCase()

  return filters.value.status === 'all'
    ? `${pagination.value.total} ${pagination.value.total === 1 ? 'device' : 'devices'}, each tracked by serial number`
    : `${pagination.value.total} ${label}`
})

const isImportOpen = ref(false)

async function importCsv(file: File) {
  if (await importProductInventoryCsv(file))
    isImportOpen.value = false
}
</script>

<template>
  <ListPage
    title="Devices"
    :subtitle="subtitle"
    :loading="loading"
    :pagination="pagination"
    :row-count="productInventories.length"
    :columns="6"
    :empty-text="filters.search || filters.status !== 'all' ? 'No devices match. Try another serial number, model or filter.' : 'No devices yet. Add them one by one or import a CSV.'"
    @page="page => fetchAllProductInventory({ page })"
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
        @click="addProductInventory"
      >
        Add device
      </VBtn>
    </template>

    <template #filters>
      <AppTextField
        v-model="filters.search"
        aria-label="Search devices"
        placeholder="Serial number, model or brand"
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 360px; min-inline-size: 220px;"
      />
      <!-- Chips wrap onto a new line on narrow screens; a button group would overflow. -->
      <VChipGroup
        v-model="filters.status"
        mandatory
        column
        selected-class="bg-primary"
        aria-label="Show"
      >
        <VChip
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
          size="large"
          variant="outlined"
        >
          {{ option.label }}
        </VChip>
      </VChipGroup>
    </template>

    <template #head>
      <th>Device</th>
      <th class="fit">
        Serial number
      </th>
      <th>Supplier</th>
      <th class="fit text-end">
        Price
      </th>
      <th class="fit">
        Status
      </th>
      <th class="fit">
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="unit in productInventories"
      :key="unit.inventory_uuid"
      :class="{ archived: unit.deleted_at }"
    >
      <td class="py-3">
        <div class="font-weight-medium text-body-1">
          {{ unit.product_name }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ unit.product_brand }} {{ unit.product_model_number }}, {{ unit.category_name }}
        </div>
      </td>
      <td class="text-body-1">
        {{ unit.serial_number }}
      </td>
      <td>
        <div class="text-body-1">
          {{ unit.supplier_shop_name }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ unit.supplier_name }}
        </div>
      </td>
      <td class="text-end text-body-1 text-no-wrap">
        {{ kes(unit.default_price) }}
      </td>
      <td>
        <div class="d-flex gap-1">
          <VChip
            :color="statusLabel[unit.status]?.color ?? 'default'"
            size="small"
          >
            {{ statusLabel[unit.status]?.text ?? unit.status }}
          </VChip>
          <VChip
            v-if="unit.deleted_at"
            color="error"
            size="small"
          >
            Removed
          </VChip>
        </div>
        <div
          v-if="unit.product_active_status === 0"
          class="text-body-2 text-error mt-1"
        >
          Its product is switched off
        </div>
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${unit.serial_number}`"
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
              @click="editProductInventory(unit)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(unit.inventory_uuid, 'Device')"
            />
            <VDivider class="my-1" />
            <VListItem
              v-if="unit.deleted_at"
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restoreProductInventory(unit)"
            />
            <VListItem
              v-else
              prepend-icon="tabler-archive"
              title="Remove"
              base-color="error"
              @click="deleteProductInventoryModal(unit)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

  <CsvImportDialog
    v-model="isImportOpen"
    title="Import devices"
    hint="Upload a CSV with one device per row and these columns: product_uuid, supplier_uuid, serial_number, source_type (Inventory or Outsourced), status (InStock or ReturnedToSupplier). Copy the IDs from the Products and Suppliers lists."
    :loading="loading"
    @upload="importCsv"
  />
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
</template>
