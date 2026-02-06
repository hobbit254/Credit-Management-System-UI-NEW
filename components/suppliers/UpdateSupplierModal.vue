<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type {Supplier} from "@/schemas/suppliers";

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
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Update Supplier"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localSupplierName"
                label="Supplier Name*"
                placeholder="Enter supplier name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localSupplierShopName"
                label="Supplier Shop Name"
                placeholder="Enter supplier shop Name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localSupplierPhone"
                label="Supplier Phone Number"
                placeholder="Enter supplier phone number"
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
