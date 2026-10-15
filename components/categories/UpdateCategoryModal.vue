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
  <FormDialog
    v-model="isOpen"
    title="Edit category"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localCategory.category_name"
          label="Category Name*"
          placeholder="Enter category name"
          autofocus
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
