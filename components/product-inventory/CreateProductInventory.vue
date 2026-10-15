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
  if (JSON.stringify(newVal) !== JSON.stringify(localProductInventory.value))
    localProductInventory.value = { ...newVal }
}, { deep: true })

watch(localProductInventory, newVal => {
  emit('update:productInventory', newVal)
}, { deep: true })

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

// Load each time the dialog opens: the page mounts it once, so loading on mount kept
// lists from when the page opened (e.g. a unit sold a minute ago still offered).
watch(() => props.modelValue, async open => {
  if (!open)
    return
  loadingProducts.value = true
  loadingSuppliers.value = true
  try {
    const [productData, supplierData] = await Promise.all([
      fetchActiveProducts(),
      fetchActiveSupplier(),
    ])

    products.value = productData as unknown as Product[]
    suppliers.value = supplierData as unknown as Supplier[]
  }
  finally {
    loadingProducts.value = false
    loadingSuppliers.value = false
  }
}, { immediate: true })

const productItemTitle = (item: Product) => {
  if (!item)
    return ''

  return `${item.product_name ?? ''} - ${item.product_brand ?? ''} - ${item.product_model_number ?? ''}`
}

const productFilter = (item: Product, queryText: string) => {
  const text = `${item.product_name} ${item.product_brand} ${item.product_model_number}`.toLowerCase()

  return text.includes(queryText.toLowerCase())
}

const sourceTypeLabels = ['Inventory', 'Outsourced']

// Sold, OnCredit and Paid are set by sales, so new stock starts as one of these.
const statusLabels = ['InStock', 'ReturnedToSupplier']
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Add a device"
    description="One device per serial number."
    confirm-text="Add device"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <!-- Product -->
      <VCol cols="12">
        <VAutocomplete
          v-model="localProductInventory.product_uuid"
          :items="products"
          :item-title="productItemTitle"
          item-value="product_uuid"
          :loading="loadingProducts"
          label="Product*"
          placeholder="Search by name, brand or model..."
          clearable
          variant="outlined"
          :filter="productFilter"
          :error-messages="fieldErrors.product_uuid"
        >
          <template #item="{ item, props: itemProps }">
            <VListItem v-bind="itemProps">
              <template #title>
                <span class="font-weight-medium">{{ item.raw.product_name }}</span>
              </template>
              <template #subtitle>
                <div class="d-flex align-center ga-1 mt-1">
                  <VChip
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                  >
                    {{ item.raw.product_brand }}
                  </VChip>
                  <VChip
                    size="x-small"
                    color="info"
                    variant="tonal"
                  >
                    {{ item.raw.product_model_number }}
                  </VChip>
                </div>
              </template>
            </VListItem>
          </template>
        </VAutocomplete>
      </VCol>

      <!-- Serial Number -->
      <VCol cols="12">
        <AppTextField
          v-model="localProductInventory.serial_number"
          label="Serial Number*"
          placeholder="Enter serial number"
          :error-messages="fieldErrors.serial_number"
        />
      </VCol>

      <!-- Source Type -->
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="localProductInventory.source_type"
          :items="sourceTypeLabels"
          label="Source Type*"
          placeholder="Select source type"
          :error-messages="fieldErrors.source_type"
        />
      </VCol>

      <!-- Status -->
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="localProductInventory.status"
          :items="statusLabels"
          label="Status*"
          placeholder="Select status"
          :error-messages="fieldErrors.status"
        />
      </VCol>

      <!-- Current Status Preview -->
      <VCol
        v-if="localProductInventory.status"
        cols="12"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          Status set to {{ localProductInventory.status }}
        </p>
      </VCol>

      <!-- Supplier -->
      <VCol cols="12">
        <VAutocomplete
          v-model="localProductInventory.supplier_uuid"
          :items="suppliers"
          item-title="supplier_name"
          item-value="supplier_uuid"
          :loading="loadingSuppliers"
          label="Supplier*"
          placeholder="Select a supplier"
          clearable
          variant="outlined"
          :error-messages="fieldErrors.supplier_uuid"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
