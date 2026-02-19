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

function closeModal() {
  isOpen.value = false
}

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
          <VIcon>tabler-category</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New Category</span>
          <span class="text-caption text-medium-emphasis">Create a grouping for your products</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Category Details
              </p>
              <AppTextField
                v-model="localCategory.category_name"
                label="Category Name*"
                placeholder="e.g. Electronics, Furniture, etc."
                :error-messages="fieldErrors.category_name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-tag
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-2"
            >
              <VAlert
                color="info"
                variant="tonal"
                density="compact"
                class="text-caption"
              >
                Categories help you organize products and generate better inventory reports.
              </VAlert>
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
          Save Category
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
