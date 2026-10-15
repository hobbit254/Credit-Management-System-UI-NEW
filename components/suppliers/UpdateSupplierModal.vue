<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { phoneNumber } from '@/schemas/phone'
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

// Same phone rule as adding one.
const phoneError = ref('')

function handleConfirm() {
  if (!props.supplier)
    return

  const phone = phoneNumber.safeParse(localSupplierPhone.value)

  phoneError.value = phone.success ? '' : phone.error.issues[0]?.message ?? ''
  if (!phone.success)
    return

  emit('confirm', {
    supplier_uuid: props.supplier.supplier_uuid,
    supplier_name: localSupplierName.value,
    supplier_shop_name: localSupplierShopName.value,
    supplier_phone: phone.data,
  })
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit supplier"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="localSupplierName"
          label="Representative Name"
          placeholder="Enter full name"
          persistent-placeholder
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="localSupplierShopName"
          label="Business / Shop Name"
          placeholder="Official shop name"
          persistent-placeholder
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="localSupplierPhone"
          :error-messages="phoneError"
          label="Contact Phone Number"
          placeholder="e.g. 0712 345 678"
          type="tel"
          persistent-placeholder
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
