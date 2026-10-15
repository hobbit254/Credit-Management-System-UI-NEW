<script setup lang="ts">
import { onMounted } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useSuppliers } from '@/composables/suppliers/useSuppliers'

definePageMeta({
  subject: 'v1/suppliers',
})

const {
  showToast, suppliers, loading, pagination, filters, fetchAllSuppliers,
  newSupplier, openAdd, addSupplier, createSupplier,
  openEdit, supplierToEdit, editSupplier, updateSupplier,
  deactivateSupplier, activateSupplier, restoreSupplier,
  openDelete, supplierToDelete, deleteSupplierModal, deleteSupplier,
} = useSuppliers()

onMounted(() => fetchAllSuppliers())

// A new search starts again from page 1.
watchDebounced(() => filters.value.search, () => fetchAllSuppliers({ page: 1 }), { debounce: 300 })

function copyId(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({ title: 'Copied', text: 'Supplier ID copied', color: 'success', icon: 'tabler-clipboard-check' })
}
</script>

<template>
  <ListPage
    title="Suppliers"
    :subtitle="`${pagination.total} ${pagination.total === 1 ? 'supplier' : 'suppliers'} you buy devices from`"
    :loading="loading"
    :pagination="pagination"
    :row-count="suppliers.length"
    :columns="3"
    :empty-text="filters.search ? 'No suppliers match. Try another shop, name or phone.' : 'No suppliers yet. Add one before adding devices.'"
    @page="page => fetchAllSuppliers({ page })"
  >
    <template #actions>
      <VBtn
        prepend-icon="tabler-plus"
        @click="addSupplier"
      >
        Add supplier
      </VBtn>
    </template>

    <template #filters>
      <AppTextField
        v-model="filters.search"
        aria-label="Search suppliers"
        placeholder="Shop, contact or phone"
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 360px; min-inline-size: 220px;"
      />
    </template>

    <template #head>
      <th>Supplier</th>
      <th>Phone</th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="supplier in suppliers"
      :key="supplier.supplier_uuid"
      :class="{ archived: supplier.deleted_at }"
    >
      <td class="py-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="font-weight-medium text-body-1">{{ supplier.supplier_shop_name }}</span>
          <VChip
            v-if="supplier.deleted_at"
            color="error"
            size="small"
          >
            Archived
          </VChip>
          <VChip
            v-else-if="!supplier.active"
            color="warning"
            size="small"
          >
            Switched off
          </VChip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ supplier.supplier_name }}
        </div>
      </td>
      <td class="text-body-1">
        <a
          v-if="supplier.supplier_phone"
          :href="`tel:${supplier.supplier_phone}`"
          class="text-primary"
        >{{ supplier.supplier_phone }}</a>
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${supplier.supplier_shop_name}`"
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
              @click="editSupplier(supplier)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(supplier.supplier_uuid)"
            />
            <!-- Archived rows are restored, not switched on -->
            <template v-if="!supplier.deleted_at">
              <VDivider class="my-1" />
              <VListItem
                :prepend-icon="supplier.active ? 'tabler-lock-pause' : 'tabler-lock-open'"
                :title="supplier.active ? 'Switch off' : 'Switch on'"
                @click="supplier.active ? deactivateSupplier(supplier) : activateSupplier(supplier)"
              />
              <VListItem
                prepend-icon="tabler-archive"
                title="Archive"
                base-color="error"
                @click="deleteSupplierModal(supplier)"
              />
            </template>
            <VListItem
              v-else
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restoreSupplier(supplier)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

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
