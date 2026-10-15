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

// Clear old errors once the pop-up has closed.
watch(isOpen, open => {
  if (!open)
    fieldErrors.value = {}
})

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
  <FormDialog
    v-model="isOpen"
    title="Add a supplier"
    confirm-text="Add supplier"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="localSupplier.supplier_name"
          label="Representative Name"
          placeholder="Person to contact"
          :error-messages="fieldErrors.supplier_name"
          persistent-placeholder
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
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="localSupplier.supplier_phone"
          label="Phone Number"
          placeholder="e.g. 0712 345 678"
          type="tel"
          :error-messages="fieldErrors.supplier_phone"
          persistent-placeholder
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
