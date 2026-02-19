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
  { title: 'Category', key: 'category_name' },
  { title: 'Active', key: 'active' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },
  { title: 'Deleted', key: 'deleted_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
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
            <VAvatar
              color="primary"
              variant="tonal"
              size="32"
            >
              <VIcon size="18">
                tabler-category
              </VIcon>
            </VAvatar>
            <span class="text-h6 font-weight-bold">Product Categories</span>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="addCategory"
          >
            Add Category
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="categories"
          :loading="loading"
          item-key="category_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
          :row-props="getRowProps"
        >
          <template #item.category_name="{ item }">
            <div class="d-flex align-center ga-3">
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.category_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-body-2">{{ item.category_name ?? '—' }}</span>
                <span class="text-xxs text-medium-emphasis font-mono">
                  {{ item.category_uuid.split('-')[0] }}...
                </span>
              </div>
            </div>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

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

                <VListItem @click="copyUuid(item.category_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-copy
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy UUID</VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem @click="editCategory(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-edit
                    </VIcon>
                  </template>
                  <VListItemTitle>Edit Category</VListItemTitle>
                </VListItem>

                <VListItem
                  v-if="item.deleted_at !== null"
                  @click="restoreCategory(item)"
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
                    Restore
                  </VListItemTitle>
                </VListItem>

                <VListItem
                  v-else
                  @click="deleteCategoryModal(item)"
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
                    Delete
                  </VListItemTitle>
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivateCategory(item) : activateCategory(item)"
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

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-10 ga-2">
              <VIcon
                size="48"
                color="secondary"
                class="opacity-50"
              >
                tabler-category-2
              </VIcon>
              <span class="text-body-1 text-medium-emphasis">No categories found</span>
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
                @click="addCategory"
              >
                Create your first category
              </VBtn>
            </div>
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
                  @update:model-value="(page: number) => fetchAllCategories(page)"
                />
              </div>
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
