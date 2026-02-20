<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '@/schemas/suppliers'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  supplier: Supplier | null
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
  if (props.supplier)
    emit('confirm', props.supplier)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="450"
    persistent
  >
    <VCard class="border-t-lg border-error shadow-xl">
      <VCardTitle class="pa-4 d-flex align-center ga-3">
        <VAvatar
          color="error"
          variant="tonal"
          size="44"
          rounded="lg"
        >
          <VIcon size="24">
            tabler-alert-triangle
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-black text-error">Archive Partner</span>
          <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-tighter">
            Security Confirmation
          </span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <div class="bg-error-lighten-5 pa-4 rounded-lg border border-error-lighten-3 mb-4">
          <p class="text-body-2 text-high-emphasis mb-1">
            You are about to archive <strong>{{ props.supplier?.supplier_shop_name }}</strong>.
          </p>
          <p class="text-caption text-error font-weight-medium">
            This will hide the supplier from active procurement lists.
          </p>
        </div>

        <div class="d-flex flex-column ga-2">
          <div class="d-flex justify-space-between text-xxs">
            <span class="text-disabled uppercase font-weight-bold">Representative:</span>
            <span class="text-high-emphasis font-weight-medium">{{ props.supplier?.supplier_name }}</span>
          </div>
          <div class="d-flex justify-space-between text-xxs">
            <span class="text-disabled uppercase font-weight-bold">Partner ID:</span>
            <span class="text-high-emphasis font-mono">#{{ props.supplier?.supplier_uuid?.split('-')[0] }}</span>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 bg-var-theme-background">
        <VBtn
          variant="plain"
          color="secondary"
          class="font-weight-bold"
          :disabled="props.loading"
          @click="closeModal"
        >
          No, Keep
        </VBtn>
        <VSpacer />
        <VBtn
          color="error"
          variant="elevated"
          min-width="140"
          :loading="props.loading"
          @click="handleConfirm"
        >
          <VIcon start>
            tabler-archive
          </VIcon>
          Archive Partner
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-t-lg {
  border-top-width: 6px !important;
  border-top-style: solid !important;
}

.text-xxs {
  font-size: 0.7rem;
}

.font-mono {
  font-family: 'Fira Code', 'Roboto Mono', monospace;
}

.bg-error-lighten-5 {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.05) !important;
}
</style>
