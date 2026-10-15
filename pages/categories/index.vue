<script setup lang="ts">
import { onMounted } from 'vue'
import { useCategory } from '@/composables/categories/useCategory'
import { copyId } from '@/utils/clipboard'

definePageMeta({
  subject: 'v1/categories',
})

const {
  pagination, categories, loading, fetchAllCategories,
  openAdd, addCategory, newCategory, createCategory,
  editCategory, updateCategory, openEdit, categoryToEdit,
  categoryToDelete, deleteCategoryModal, openDelete, deleteCategory,
  restoreCategory, activateCategory, deactivateCategory,
} = useCategory()

onMounted(() => fetchAllCategories())

const added = (date: string) => new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <ListPage
    title="Categories"
    subtitle="Groups for your products, such as phones or accessories."
    :loading="loading"
    :pagination="pagination"
    :row-count="categories.length"
    :columns="3"
    empty-text="No categories yet. Add one before adding products."
    @page="page => fetchAllCategories({ page })"
  >
    <template #actions>
      <VBtn
        prepend-icon="tabler-plus"
        @click="addCategory"
      >
        Add category
      </VBtn>
    </template>

    <template #head>
      <th>Category</th>
      <th>Added</th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="category in categories"
      :key="category.category_uuid"
      :class="{ archived: category.deleted_at }"
    >
      <td class="py-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="font-weight-medium text-body-1">{{ category.category_name }}</span>
          <VChip
            v-if="category.deleted_at"
            color="error"
            size="small"
          >
            Archived
          </VChip>
          <VChip
            v-else-if="!category.active"
            color="warning"
            size="small"
          >
            Switched off
          </VChip>
        </div>
      </td>
      <td class="text-body-1 text-medium-emphasis">
        {{ added(category.created_at) }}
      </td>
      <td class="text-end">
        <VMenu location="bottom end">
          <template #activator="{ props: menuProps }">
            <VBtn
              :aria-label="`Actions for ${category.category_name}`"
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
              @click="editCategory(category)"
            />
            <VListItem
              prepend-icon="tabler-copy"
              title="Copy ID"
              @click="copyId(category.category_uuid, 'Category')"
            />
            <!-- Archived rows are restored, not switched on -->
            <template v-if="!category.deleted_at">
              <VDivider class="my-1" />
              <VListItem
                :prepend-icon="category.active ? 'tabler-lock-pause' : 'tabler-lock-open'"
                :title="category.active ? 'Switch off' : 'Switch on'"
                @click="category.active ? deactivateCategory(category) : activateCategory(category)"
              />
              <VListItem
                prepend-icon="tabler-archive"
                title="Archive"
                base-color="error"
                @click="deleteCategoryModal(category)"
              />
            </template>
            <VListItem
              v-else
              prepend-icon="tabler-restore"
              title="Restore"
              @click="restoreCategory(category)"
            />
          </VList>
        </VMenu>
      </td>
    </tr>
  </ListPage>

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
