<script setup lang="ts">
import { useCategory } from '@/composables/categories/useCategory'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  pagination,
  categories,
  loading,
  showToast,
  fetchAllCategories,
  openAdd,
  addCategory,
  newCategory,
  createCategory,
  editCategory,
  updateCategory,
  openEdit,
  categoryToEdit,
  categoryToDelete,
  deleteCategoryModal,
  openDelete,
  deleteCategory,
  restoreCategory,
  activateCategory,
  deactivateCategory,
} = useCategory()

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllCategories()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllCategories()
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
  { title: 'Category UUID', key: 'category_uuid' },
  { title: 'Category Name', key: 'category_name' },
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
          <span class="text-h6">Categories Table</span>
          <VBtn
            color="primary"
            @click="addCategory"
          >
            Add Debtor
          </VBtn>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="categories"
          :loading="loading"
          item-key="category_uuid"
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
                <VListItem @click="copyUuid(item.category_uuid)">
                  <VIcon>tabler-copy</VIcon>
                  <span class="ms-2">Copy UUID</span>
                </VListItem>
                <VDivider />

                <VListItem @click="editCategory(item)">
                  <VIcon>tabler-edit</VIcon>
                  <span class="ms-2">Edit Category</span>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreCategory(item)"
                >
                  <VIcon>tabler-restore</VIcon>
                  <span class="ms-2">Restore Category</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="deleteCategoryModal(item)"
                >
                  <VIcon>tabler-trash</VIcon>
                  <span class="ms-2">Delete Category</span>
                </VListItem>
                <VListItem
                  v-if="item.active === 1"
                  @click="deactivateCategory(item)"
                >
                  <VIcon>tabler-radio-off</VIcon>
                  <span class="ms-2">Deactivate Category</span>
                </VListItem>
                <VListItem
                  v-else
                  @click="activateCategory(item)"
                >
                  <VIcon>tabler-radio</VIcon>
                  <span class="ms-2">Activate Category</span>
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
                @update:model-value="(page: number) => fetchAllCategories(page)"
              />
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>
  <CreateCategoryModal
    v-model:model-value="openAdd"
    v-model:category="newCategory"
    :loading="loading"
    @confirm="createCategory"
  />
  <UpdateCategoryModal
    v-model:model-value="openEdit"
    v-model:category="categoryToEdit"
    :loading="loading"
    @confirm="updateCategory"
  />
  <DeleteCategoryModal
    v-model:model-value="openDelete"
    v-model:category="categoryToDelete"
    :loading="loading"
    @confirm="deleteCategory"
  />
</template>
