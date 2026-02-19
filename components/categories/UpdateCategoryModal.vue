<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { Category } from '@/schemas/category'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  category: Category | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

function closeModal() {
  isOpen.value = false
}

// Local editable copy
const localCategory = ref<Partial<Category>>({
  category_name: '',
})

// Sync local state when the prop changes (e.g., when the modal opens)
watch(
  () => props.category,
  newCategory => {
    if (newCategory)
      localCategory.value = { ...newCategory }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.category)
    return

  emit('confirm', {
    ...localCategory.value,
    category_uuid: props.category.category_uuid,
  })
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="500"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-edit</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Edit Category</span>
          <span class="text-caption text-medium-emphasis">Modify the category name or settings</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol
              cols="12"
              class="mb-2"
            >
              <div class="d-flex align-center ga-2 pa-2 rounded bg-var-theme-background border-dashed">
                <VIcon
                  size="16"
                  color="primary"
                >
                  tabler-info-circle
                </VIcon>
                <span class="text-caption text-medium-emphasis">
                  Editing: <strong>{{ props.category?.category_name }}</strong>
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Category Name
              </p>
              <AppTextField
                v-model="localCategory.category_name"
                label="Category Name*"
                placeholder="Enter category name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-tag
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VSpacer />
        <VBtn
          variant="plain"
          prepend-icon="tabler-x"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-check"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Update Category
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
