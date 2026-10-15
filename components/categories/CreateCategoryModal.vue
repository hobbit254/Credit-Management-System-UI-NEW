<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type NewCategory, NewCategorySchema } from '@/schemas/category'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  category: NewCategory
}>()

const emit = defineEmits(['update:modelValue', 'update:category', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localCategory = ref<NewCategory>({ ...props.category })

// Sync local state with props
watch(() => props.category, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localCategory.value))
    localCategory.value = { ...newVal }
}, { deep: true })

// Emit changes back to parent
watch(localCategory, newVal => {
  emit('update:category', newVal)
}, { deep: true })

const fieldErrors = ref<Record<string, string[]>>({})

function handleConfirm() {
  const result = NewCategorySchema.safeParse(localCategory.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Add a category"
    description="Groups your products, such as phones or accessories."
    confirm-text="Add category"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localCategory.category_name"
          label="Category Name*"
          placeholder="e.g. Electronics, Furniture, etc."
          :error-messages="fieldErrors.category_name"
          autofocus
        />
      </VCol>

      <VCol
        cols="12"
        class="mt-2"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          Categories help you organize products and generate better inventory reports.
        </p>
      </VCol>
    </VRow>
  </FormDialog>
</template>
