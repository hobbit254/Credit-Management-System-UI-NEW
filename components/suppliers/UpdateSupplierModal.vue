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

// Theme logic for CSS variable safety
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
    <VCard :style="{ backgroundColor: surfaceColor }">
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="secondary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-edit-circle</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Update Partner Details</span>
          <span class="text-caption text-medium-emphasis">Modify supplier profile and contact info</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol
              cols="12"
              class="mb-4"
            >
              <div class="pa-3 rounded bg-var-theme-background border-dashed d-flex justify-space-between align-center">
                <div class="d-flex flex-column ga-1">
                  <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">Supplier UUID</span>
                  <code class="text-xs text-primary">{{ props.supplier?.supplier_uuid }}</code>
                </div>
                <VChip
                  size="x-small"
                  :color="props.supplier?.active ? 'success' : 'error'"
                  variant="tonal"
                  label
                  class="text-uppercase"
                >
                  {{ props.supplier?.active ? 'Active Partner' : 'Inactive' }}
                </VChip>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Core Identity
              </p>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplierName"
                label="Representative Name*"
                placeholder="Enter representative name"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-edit
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-2"
            >
              <AppTextField
                v-model="localSupplierShopName"
                label="Business / Shop Name*"
                placeholder="Enter business name"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-building-store
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-4"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Communication
              </p>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplierPhone"
                label="Contact Phone Number"
                placeholder="Enter phone number"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-phone
                  </VIcon>
                </template>
              </AppTextField>
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
          prepend-icon="tabler-refresh"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Update Supplier
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.text-xxs {
  font-size: 0.65rem;
}

/* Variable-safe background binding */
.v-card {
  background-color: v-bind(surfaceColor);
}

.bg-var-theme-background {
  background-color: rgba(var(--v-theme-on-surface,255,255,255), 0.04);
}
</style>
