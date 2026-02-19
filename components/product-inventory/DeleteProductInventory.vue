<script setup lang="ts">
import { computed } from 'vue'
import type { ProductInventory } from '@/schemas/productInventory'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  productInventory: ProductInventory | null
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
  if (props.productInventory)
    emit('confirm', props.productInventory)
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
          <span class="text-h6 font-weight-bold">Remove Inventory Item</span>
          <span class="text-caption text-error font-weight-medium">Permanent Action</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Are you sure you want to delete this specific unit from the inventory? This will remove all history associated with this serial number.
        </p>

        <VCard
          variant="flat"
          color="secondary-lighten-5"
          class="border pa-4 rounded-lg"
        >
          <div class="d-flex flex-column ga-3">
            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Product</span>
              <span class="text-body-2 font-weight-bold text-high-emphasis">
                {{ props.productInventory?.product_name ?? 'N/A' }}
              </span>
            </div>

            <VDivider />

            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Serial Number</span>
              <code class="text-primary font-weight-bold">
                {{ props.productInventory?.serial_number ?? 'NO-SERIAL' }}
              </code>
            </div>

            <VDivider />

            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Current Status</span>
              <VChip
                size="x-small"
                :color="props.productInventory?.status === 'Available' ? 'success' : 'error'"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ props.productInventory?.status?.toUpperCase() ?? 'UNKNOWN' }}
              </VChip>
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
            This unit will be removed from stock counts immediately.
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
          Confirm Deletion
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
