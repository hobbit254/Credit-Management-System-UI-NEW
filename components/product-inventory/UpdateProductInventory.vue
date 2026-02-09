<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import type { ProductInventory } from '@/schemas/productInventory'
import { useProduct } from '@/composables/products/useProduct'
import { useSuppliers } from '@/composables/suppliers/useSuppliers'
import type { Product } from '@/schemas/products'
import type { Supplier } from '@/schemas/suppliers'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  productInventory: ProductInventory | null
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
const localStatus = ref('')
const localSerialNumber = ref('')
const localProductUuid = ref('')
const localSupplierUuid = ref('')
const localSourceType = ref('')

watch(
  () => props.productInventory,
  newProductInventory => {
    if (newProductInventory) {
      localStatus.value = newProductInventory.status
      localSerialNumber.value = newProductInventory.serial_number
      localSourceType.value = newProductInventory.source_type
      localProductUuid.value = newProductInventory.product_uuid
      localSupplierUuid.value = newProductInventory.supplier_uuid
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.productInventory)
    return
  emit('confirm', {
    inventory_uuid: props.productInventory?.inventory_uuid,
    status: localStatus.value,
    serial_number: localSerialNumber.value,
    product_uuid: localProductUuid.value,
    source_type: localSourceType.value,
    supplier_uuid: localSupplierUuid.value,
  })
}
const { fetchActiveProducts } = useProduct()
const { fetchActiveSupplier } = useSuppliers()
const products = ref<Product[]>([])
const suppliers = ref<Supplier[]>([])
const loadingProducts = ref<boolean>(false)
const loadingSuppliers = ref<boolean>(false)

onMounted(async () => {
  loadingProducts.value = true
  loadingSuppliers.value = true
  try {
    const data = await fetchActiveProducts()
    const supplierData = await fetchActiveSupplier()

    products.value = data as unknown as Product[]
    suppliers.value = supplierData as unknown as Supplier[]
  }
  finally {
    loadingProducts.value = false
    loadingSuppliers.value = false
  }
})

const productItemTitle = (item: Product) => {
  if (!item)
    return ''

  return `${item.product_name ?? ''} - ${item.product_brand ?? ''} - ${item.product_model_number ?? ''}`
}

const productFilter = (item: Product, queryText: string) => {
  const text = `${item.product_name} ${item.product_brand} ${item.product_model_number}`.toLowerCase()

  return text.includes(queryText.toLowerCase())
}

const sourceTypes = ['Inventory', 'Outsourced']
const status = ['InStock', 'Returned', 'ReturnedToSupplier', 'OnCredit', 'Paid', 'Sold']
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Update Debtors"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <VAutocomplete
                v-model="localProductUuid"
                :items="products"
                :item-title="productItemTitle"
                item-value="product_uuid"
                :loading="loadingProducts"
                label="Product Name*"
                placeholder="Search product..."
                clearable
                :filter="productFilter"
                disabled
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model:="localSourceType"
                :items="sourceTypes"
                label="Source Type*"
                placeholder="Select a Source Type*"
                disabled
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model:="localStatus"
                :items="status"
                label="Product Inventory Status*"
                placeholder="Select Product Inventory Status*"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localSerialNumber"
                label="Serial Number*"
                placeholder="Enter Serial  Number"
              />
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="localSupplierUuid"
                :items="suppliers"
                item-title="supplier_name"
                item-value="supplier_uuid"
                :loading="loadingSuppliers"
                label="Supplier *"
                placeholder="Select a Supplier *"
                clearable
                disabled
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
