<script setup lang="ts">
import { ref } from 'vue'
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

watch(() => props.category, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localCategory.value))
    localCategory.value = { ...newVal }
}, { deep: true })

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
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-user"
      title="Add New Category"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localCategory.category_name"
                label="Debtor Name*"
                placeholder="Enter Debtor Name"
                :error-messages="fieldErrors.debtor_name"
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
