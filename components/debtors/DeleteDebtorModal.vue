<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import type { Debtor } from '@/schemas/debtors'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  debtor: Debtor | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

function closeModal() {
  isOpen.value = false
}

function handleConfirm() {
  if (props.debtor)
    emit('confirm', props.debtor)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="450"
    persistent
  >
    <VCard :style="{ backgroundColor: surfaceColor }">
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
          <span class="text-h6 font-weight-bold">Delete Debtor</span>
          <span class="text-caption text-error font-weight-medium text-uppercase">Financial Record Removal</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Are you sure you want to delete this debtor? This will archive their credit history and restrict any further transactions.
        </p>

        <VCard
          variant="outlined"
          class="pa-4 rounded-lg border-dashed"
          :style="{ backgroundColor: `rgba(var(--v-theme-error), 0.04)` }"
        >
          <div class="d-flex align-center ga-3 mb-3">
            <VAvatar
              size="40"
              color="error"
              variant="tonal"
              rounded="pill"
            >
              <VIcon size="20">
                tabler-user-minus
              </VIcon>
            </VAvatar>

            <div class="d-flex flex-column overflow-hidden">
              <span class="text-body-1 font-weight-bold text-high-emphasis text-truncate">
                {{ props.debtor?.debtor_name }}
              </span>
              <span class="text-xxs text-medium-emphasis text-truncate">
                {{ props.debtor?.debtor_email || 'No email associated' }}
              </span>
            </div>
          </div>

          <VDivider class="my-2 border-opacity-25" />

          <div class="d-flex justify-space-between align-center mt-2">
            <div class="d-flex flex-column">
              <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">Credit Limit</span>
              <span class="text-body-2 font-weight-bold text-error">
                {{ formatCurrency(props.debtor?.credit_limit || 0) }}
              </span>
            </div>
            <VChip
              size="x-small"
              color="error"
              variant="flat"
              label
            >
              {{ props.debtor?.debtor_type }}
            </VChip>
          </div>
        </VCard>

        <VAlert
          type="error"
          variant="tonal"
          density="compact"
          class="mt-4 border-none"
          icon="tabler-alert-triangle"
        >
          <span class="text-caption">
            All pending invoices and credit terms will be archived.
          </span>
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn
          variant="plain"
          prepend-icon="tabler-arrow-back-up"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
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
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), 0.4) !important;
}

.text-xxs {
  font-size: 0.65rem;
}
</style>
