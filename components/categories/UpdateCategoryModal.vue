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

// Local editable copies
const localCategoryName = ref('')

watch(
  () => props.category,
  newCategory => {
    if (newCategory)
      localCategoryName.value = newCategory.category_name
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.category)
    return
  emit('confirm', {
    category_uuid: props.category.category_uuid,
    category_name: localCategoryName.value,
  })
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Update Category"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localCategoryName"
                label="Category Name*"
                placeholder="Enter Category Name"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          text="Cancel"
          variant="plain"
          @click="closeModal"
        />

        <VBtn
          color="primary"
          text="Save"
          variant="tonal"
          :loading="props.loading"
          @click="handleConfirm"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
