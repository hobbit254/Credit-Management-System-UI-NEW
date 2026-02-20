<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type NewSupplier, NewSupplierSchema } from '@/schemas/suppliers'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  supplier: NewSupplier
}>()

const emit = defineEmits(['update:modelValue', 'update:supplier', 'confirm'])

// Modal Visibility Control
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localSupplier = ref<NewSupplier>({ ...props.supplier })
const fieldErrors = ref<Record<string, string[]>>({})

// Watch for external reset (when parent clears the object)
watch(() => props.modelValue, val => {
  if (val) {
    localSupplier.value = { ...props.supplier }
    fieldErrors.value = {}
  }
})

// Sync local changes back to parent
watch(localSupplier, newVal => {
  emit('update:supplier', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false

  // Delay error clearing slightly to avoid visual flicker during close animation
  setTimeout(() => { fieldErrors.value = {} }, 200)
}

function handleConfirm() {
  const result = NewSupplierSchema.safeParse(localSupplier.value)

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
    max-width="550"
    persistent
    scrollable
  >
    <VCard class="border shadow-lg">
      <VCardTitle class="d-flex align-center ga-3 pa-4 bg-var-theme-surface">
        <VAvatar
          color="primary"
          variant="tonal"
          size="44"
          rounded="lg"
        >
          <VIcon size="24">
            tabler-building-community
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-black">Register Supplier</span>
          <span class="text-caption text-medium-emphasis">Create a new procurement partnership</span>
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
              class="pb-0"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <VIcon
                  size="16"
                  color="primary"
                >
                  tabler-id-badge-2
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Business Identity
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_name"
                label="Representative Name"
                placeholder="Person to contact"
                :error-messages="fieldErrors.supplier_name"
                persistent-placeholder
                prepend-inner-icon="tabler-user-check"
                autofocus
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_shop_name"
                label="Shop / Business Name"
                placeholder="Official registered name"
                :error-messages="fieldErrors.supplier_shop_name"
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
                  color="primary"
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
                v-model="localSupplier.supplier_phone"
                label="Phone Number"
                placeholder="e.g. 0712 345 678"
                type="tel"
                :error-messages="fieldErrors.supplier_phone"
                persistent-placeholder
                prepend-inner-icon="tabler-phone-call"
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
          color="primary"
          variant="elevated"
          min-width="160"
          :loading="props.loading"
          @click="handleConfirm"
        >
          <VIcon start>
            tabler-check
          </VIcon>
          Save Supplier
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.text-xxs {
  font-size: 0.65rem;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

/* Enhancing card aesthetics */
.v-card {
  border-radius: 12px !important;
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 0.08;
}
</style>
