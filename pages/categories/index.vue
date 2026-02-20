<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useCategory } from '@/composables/categories/useCategory'

const {
  pagination, categories, loading, showToast, fetchAllCategories,
  openAdd, addCategory, newCategory, createCategory,
  editCategory, updateCategory, openEdit, categoryToEdit,
  categoryToDelete, deleteCategoryModal, openDelete, deleteCategory,
  restoreCategory, activateCategory, deactivateCategory,
} = useCategory()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)
const errorColor = computed(() => theme.current.value.colors.error)

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllCategories()
  }
  finally {
    loading.value = false
  }
})

const perPageOptions = [5, 10, 25, 50, 100]

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllCategories()
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'Category UUID copied',
    color: 'success',
    icon: 'tabler-clipboard-check',
  })
}

const headers = [
  { title: 'Category Identity', key: 'category_name', fixed: true },
  { title: 'Status', key: 'active', align: 'center', width: '120px' },
  { title: 'Last Activity', key: 'updated_at', width: '200px' },
  { title: 'Lifecycle', key: 'deleted_at', width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

function getRowProps({ item }: { item: any }) {
  return item.deleted_at !== null ? { class: 'deleted-row-style text-error italic' } : {}
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
              <VIcon>tabler-hierarchy-2</VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Product Categories</span>
              <span class="text-caption text-medium-emphasis">Classify and organize your product catalog</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-folder-plus"
            variant="elevated"
            @click="addCategory"
          >
            New Category
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="categories"
          :loading="loading"
          item-key="category_uuid"
          class="flex-grow-1 category-table"
          :items-per-page="-1"
          :row-props="getRowProps"
          hover
        >
          <template #item.category_name="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <VAvatar
                size="36"
                color="primary"
                variant="tonal"
              >
                <span class="text-subtitle-2 font-weight-bold">
                  {{ item.category_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-body-2 font-weight-bold text-high-emphasis text-truncate">
                  {{ item.category_name ?? 'Unnamed Category' }}
                </span>
                <span class="text-xxs text-medium-emphasis font-mono">
                  ID: {{ item.category_uuid.split('-')[0] }}...
                </span>
              </div>
            </div>
          </template>

          <template #item.active="{ item }">
            <StatusBadge :active="item.active" />
          </template>

          <template #item.updated_at="{ item }">
            <div class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-2 text-xxs text-medium-emphasis">
                <VIcon size="12">
                  tabler-calendar-plus
                </VIcon>
                <TableDate :value="item.created_at" />
              </div>
              <div class="d-flex align-center ga-2 text-xxs text-primary">
                <VIcon size="12">
                  tabler-clock-edit
                </VIcon>
                <TableDate :value="item.updated_at" />
              </div>
            </div>
          </template>

          <template #item.deleted_at="{ item }">
            <div
              v-if="item.deleted_at"
              class="d-flex align-center ga-1 text-xxs text-error font-weight-medium"
            >
              <VIcon size="12">
                tabler-trash-x
              </VIcon>
              <TableDate :value="item.deleted_at" />
            </div>
            <span
              v-else
              class="text-caption text-disabled"
            >—</span>
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
                <VListItem @click="copyUuid(item.category_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-fingerprint
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
                  <VListItemTitle>Edit Account</VListItemTitle>
                </VListItem>
                <VListItem
                  v-if="item.deleted_at !== null"
                  color="success"
                  @click="restoreCategory(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-restore
                    </VIcon>
                  </template>
                  <VListItemTitle>Restore Account</VListItemTitle>
                </VListItem>
                <VListItem
                  v-else
                  color="error"
                  @click="deleteCategoryModal(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-archive
                    </VIcon>
                  </template>
                  <VListItemTitle>Archive Account</VListItemTitle>
                </VListItem>
                <VDivider class="my-1" />
                <VListItem
                  :color="item.active === 1 ? 'warning' : 'success'"
                  @click="item.active === 1 ? deactivateCategory(item) : activateCategory(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      {{ item.active === 1 ? 'tabler-lock-pause' : 'tabler-lock-open' }}
                    </VIcon>
                  </template>
                  <VListItemTitle>{{ item.active === 1 ? 'Suspend Account' : 'Unsuspend Account' }}</VListItemTitle>
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
.category-table :deep(td:first-child) {
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

.italic {
  font-style: italic;
}
</style>
