<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type NewSupplier, NewSupplierSchema } from '@/schemas/suppliers'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  supplier: NewSupplier
}>()

const emit = defineEmits(['update:modelValue', 'update:supplier', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localSupplier = ref<NewSupplier>({ ...props.supplier })
const fieldErrors = ref<Record<string, string[]>>({})

// Sync parent changes to local state
watch(() => props.supplier, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localSupplier.value))
    localSupplier.value = { ...newVal }
}, { deep: true })

// Sync local changes back to parent
watch(localSupplier, newVal => {
  emit('update:supplier', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
  fieldErrors.value = {}
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
    max-width="500"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="secondary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-building-community</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add Supplier</span>
          <span class="text-caption text-medium-emphasis">Register a new procurement partner</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Business Identity
              </p>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_name"
                label="Representative Name*"
                placeholder="e.g. Alexander Pierce"
                :error-messages="fieldErrors.supplier_name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-check
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_shop_name"
                label="Shop / Business Name*"
                placeholder="e.g. Global Logistics Inc."
                :error-messages="fieldErrors.supplier_shop_name"
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
                v-model="localSupplier.supplier_phone"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                :error-messages="fieldErrors.supplier_phone"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-phone-call
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
          prepend-icon="tabler-database-plus"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Register Supplier
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
/* Standard background using the theme surface color safely */
.v-card-text {
  background-color: rgb(var(--v-theme-surface, 255,255,255));
}
</style>
