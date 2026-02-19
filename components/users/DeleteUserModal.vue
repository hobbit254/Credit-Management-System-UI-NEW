<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import type { Supplier } from '@/schemas/suppliers' // Or User schema

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  supplier: Supplier | null // Adapted for Supplier context
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

// Safely compute a light overlay color without raw CSS variables
const highlightBg = computed(() => {
  return theme.current.value.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
})

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
    <VCard class="overflow-hidden">
      <VCardTitle class="d-flex align-center ga-3 pa-4 bg-error-lighten-5">
        <VAvatar
          color="error"
          variant="elevated"
          size="40"
          class="elevation-1"
        >
          <VIcon
            color="white"
            size="22"
          >
            tabler-trash-x
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold text-error">Remove Partner</span>
          <span
            class="text-caption text-error font-weight-medium text-uppercase"
            style="letter-spacing: 0.5px"
          >
            Destructive Action
          </span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Are you sure you want to remove this supplier? This action will archive their data and
          <span class="text-high-emphasis font-weight-bold">disable all active procurement links</span> associated with them.
        </p>

        <VCard
          variant="outlined"
          class="pa-4 rounded-lg border-dashed"
          :style="{ backgroundColor: highlightBg }"
        >
          <div class="d-flex align-center ga-3">
            <VAvatar
              size="44"
              color="error"
              variant="tonal"
              rounded="lg"
            >
              <VIcon size="24">
                tabler-building-store
              </VIcon>
            </VAvatar>

            <div class="d-flex flex-column overflow-hidden">
              <span class="text-body-1 font-weight-bold text-high-emphasis text-truncate">
                {{ props.supplier?.supplier_name }}
              </span>
              <span class="text-xxs text-medium-emphasis font-mono">
                ID: {{ props.supplier?.supplier_uuid?.split('-')[0] }}...
              </span>
            </div>
          </div>

          <VDivider class="my-3" />

          <div class="d-flex justify-space-between align-center">
            <div class="d-flex flex-column">
              <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">Shop Name</span>
              <span class="text-caption font-weight-medium">{{ props.supplier?.supplier_shop_name || 'N/A' }}</span>
            </div>
            <VChip
              size="x-small"
              color="error"
              variant="flat"
              class="font-weight-bold"
            >
              ARCHIVE
            </VChip>
          </div>
        </VCard>

        <div class="mt-4 d-flex ga-2 align-start text-error">
          <VIcon
            size="16"
            class="mt-1"
          >
            tabler-alert-circle
          </VIcon>
          <span class="text-caption font-weight-medium italic">
            Records can only be restored by a System Administrator.
          </span>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 bg-var-theme-background">
        <VSpacer />

        <VBtn
          variant="text"
          class="text-none"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>

        <VBtn
          color="error"
          variant="elevated"
          prepend-icon="tabler-trash"
          class="text-none px-6"
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
  border-style: dashed !important;
  border-width: 1.5px !important;
}

.text-xxs {
  font-size: 0.65rem;
}

.italic {
  font-style: italic;
}

.v-card {
  background-color: v-bind(surfaceColor);
}

/* Specific styling for the header background without using variables */
.bg-error-lighten-5 {
  background-color: #FFF5F5 !important;
}
</style>
