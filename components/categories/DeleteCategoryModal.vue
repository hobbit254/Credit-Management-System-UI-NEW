<script setup lang="ts">
import { computed } from 'vue'
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

function handleConfirm() {
  if (props.category)
    emit('confirm', props.category)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="450"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="error"
          variant="tonal"
          size="40"
        >
          <VIcon color="error">
            tabler-trash-x
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Delete Category</span>
          <span class="text-caption text-error font-weight-medium">Permanent Action</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Are you sure you want to delete this category? This action will remove the category grouping from the system.
        </p>

        <VCard
          variant="flat"
          color="secondary-lighten-5"
          class="border pa-4 rounded-lg"
        >
          <div class="d-flex flex-column ga-3">
            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Category Name</span>
              <div class="d-flex align-center ga-2">
                <VAvatar
                  size="24"
                  color="error"
                  variant="tonal"
                >
                  <span class="text-xxs font-weight-bold">
                    {{ props.category?.category_name?.charAt(0)?.toUpperCase() ?? '?' }}
                  </span>
                </VAvatar>
                <span class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ props.category?.category_name ?? 'N/A' }}
                </span>
              </div>
            </div>

            <VDivider />

            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Reference ID</span>
              <code class="text-primary font-weight-bold text-xs">
                {{ props.category?.category_uuid?.split('-')[0] ?? '—' }}...
              </code>
            </div>
          </div>
        </VCard>

        <VAlert
          color="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
          border="start"
        >
          <template #prepend>
            <VIcon size="20">
              tabler-alert-triangle
            </VIcon>
          </template>
          <span class="text-caption">
            Products currently assigned to this category may become uncategorized.
          </span>
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn
          variant="plain"
          prepend-icon="tabler-arrow-left"
          :disabled="props.loading"
          @click="closeModal"
        >
          Back
        </VBtn>

        <VBtn
          color="error"
          variant="elevated"
          prepend-icon="tabler-trash"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Confirm Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.text-xxs {
  font-size: 0.65rem;
}
</style>
