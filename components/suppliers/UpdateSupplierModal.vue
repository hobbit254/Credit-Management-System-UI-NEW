<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import type { Supplier } from '@/schemas/suppliers'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  supplier: Supplier | null
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

// Local editable copies
const localSupplierName = ref('')
const localSupplierShopName = ref('')
const localSupplierPhone = ref('')

// Initialize local state when supplier changes
watch(
  () => props.supplier,
  newSupplier => {
    if (newSupplier) {
      localSupplierName.value = newSupplier.supplier_name
      localSupplierShopName.value = newSupplier.supplier_shop_name
      localSupplierPhone.value = newSupplier.supplier_phone
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.supplier)
    return

  emit('confirm', {
    supplier_uuid: props.supplier.supplier_uuid,
    supplier_name: localSupplierName.value,
    supplier_shop_name: localSupplierShopName.value,
    supplier_phone: localSupplierPhone.value,
  })
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="550"
    scrollable
    persistent
  >
    <VCard
      class="border shadow-lg"
      :style="{ backgroundColor: surfaceColor }"
    >
      <VCardTitle class="d-flex align-center ga-3 pa-4 bg-var-theme-surface">
        <VAvatar
          color="info"
          variant="tonal"
          size="44"
          rounded="lg"
        >
          <VIcon size="24">
            tabler-edit-circle
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-black">Update Partner</span>
          <span class="text-caption text-medium-emphasis">Refine supplier profile and contact info</span>
        </div>
        <VSpacer />
        <VBtn
          icon="tabler-x"
          variant="text"
          size="small"
          density="comfortable"
          @click="closeModal"
        />
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <VForm @submit.prevent="handleConfirm">
          <VRow>
            <VCol
              cols="12"
              class="mb-2"
            >
              <div class="pa-4 rounded-lg bg-light-info border-dashed d-flex justify-space-between align-center">
                <div class="d-flex flex-column ga-1">
                  <div class="d-flex align-center ga-1">
                    <VIcon
                      size="12"
                      color="primary"
                    >
                      tabler-fingerprint
                    </VIcon>
                    <span class="text-xxs text-uppercase font-weight-black text-disabled tracking-widest">System UUID</span>
                  </div>
                  <code class="text-xs font-weight-bold text-primary">{{ props.supplier?.supplier_uuid }}</code>
                </div>
                <VChip
                  size="small"
                  :color="props.supplier?.active ? 'success' : 'error'"
                  variant="flat"
                  label
                  class="text-uppercase font-weight-bold"
                >
                  {{ props.supplier?.active ? 'Active' : 'Inactive' }}
                </VChip>
              </div>
            </VCol>

            <VCol
              cols="12"
              class="pb-0"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <VIcon
                  size="16"
                  color="info"
                >
                  tabler-id-badge-2
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Core Identity
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplierName"
                label="Representative Name"
                placeholder="Enter full name"
                persistent-placeholder
                prepend-inner-icon="tabler-user-edit"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplierShopName"
                label="Business / Shop Name"
                placeholder="Official shop name"
                persistent-placeholder
                prepend-inner-icon="tabler-building-store"
              />
            </VCol>

            <VCol
              cols="12"
              class="pt-4 pb-0"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <VIcon
                  size="16"
                  color="info"
                >
                  tabler-device-mobile-message
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Communication
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplierPhone"
                label="Contact Phone Number"
                placeholder="e.g. 0712 345 678"
                type="tel"
                persistent-placeholder
                prepend-inner-icon="tabler-phone"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 bg-var-theme-background">
        <VBtn
          variant="text"
          color="secondary"
          class="font-weight-bold"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>
        <VSpacer />
        <VBtn
          color="info"
          variant="elevated"
          min-width="160"
          :loading="props.loading"
          @click="handleConfirm"
        >
          <VIcon start>
            tabler-refresh
          </VIcon>
          Update Details
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), 0.2) !important;
}

.bg-light-info {
  background-color: rgba(var(--v-theme-info,255,255,255), 0.04);
}

.text-xxs {
  font-size: 0.65rem;
}

.tracking-widest {
  letter-spacing: 0.12em;
}

.v-card {
  border-radius: 12px !important;
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 0.08;
}
</style>
