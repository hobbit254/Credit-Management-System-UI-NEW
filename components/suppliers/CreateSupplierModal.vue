<script setup lang="ts">
import { ref } from 'vue'
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

watch(() => props.supplier, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localSupplier.value))
    localSupplier.value = { ...newVal }
}, { deep: true })

watch(localSupplier, newVal => {
  emit('update:supplier', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

const fieldErrors = ref<Record<string, string[]>>({})

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
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-user"
      title="Add New Supplier"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_name"
                label="Supplier Name*"
                placeholder="Enter supplier name"
                :error-messages="fieldErrors.supplier_name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_shop_name"
                label="Supplier Shop Name"
                placeholder="Enter supplier shop Name"
                :error-messages="fieldErrors.supplier_shop_name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localSupplier.supplier_phone"
                label="Supplier Phone Number"
                placeholder="Enter supplier phone number"
                :error-messages="fieldErrors.supplier_phone"
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
