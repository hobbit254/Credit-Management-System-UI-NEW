<script setup lang="ts">
import { ref } from 'vue'
import { type NewProductInventory, NewProductInventorySchema } from '@/schemas/productInventory'
import { useProduct } from '@/composables/products/useProduct'
import type { Product } from '@/schemas/products'
import { useSuppliers } from '@/composables/suppliers/useSuppliers'
import type { Supplier } from '@/schemas/suppliers'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  productInventory: NewProductInventory
}>()

const emit = defineEmits(['update:modelValue', 'update:productInventory', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localProductInventory = ref<NewProductInventory>({ ...props.productInventory })

watch(() => props.productInventory, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localProductInventory.value))
    localProductInventory.value = { ...newVal }
}, { deep: true })

watch(localProductInventory, newVal => {
  emit('update:productInventory', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

const fieldErrors = ref<Record<string, string[]>>({})

function handleConfirm() {
  const result = NewProductInventorySchema.safeParse(localProductInventory.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
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
      prepend-icon="tabler-user"
      title="Add New Product Inventory"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <VAutocomplete
                v-model="localProductInventory.product_uuid"
                :items="products"
                :item-title="productItemTitle"
                item-value="product_uuid"
                :loading="loadingProducts"
                label="Product Name*"
                placeholder="Search product..."
                clearable
                :filter="productFilter"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model:="localProductInventory.source_type"
                :items="sourceTypes"
                label="Source Type*"
                placeholder="Select a Source Type*"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model:="localProductInventory.status"
                :items="status"
                label="Product Inventory Status*"
                placeholder="Select Product Inventory Status*"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localProductInventory.serial_number"
                label="Serial Number*"
                placeholder="Enter Serial  Number"
                :error-messages="fieldErrors.serial_number"
              />
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="localProductInventory.supplier_uuid"
                :items="suppliers"
                item-title="supplier_name"
                item-value="supplier_uuid"
                :loading="loadingSuppliers"
                label="Supplier *"
                placeholder="Select a Supplier *"
                clearable
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
