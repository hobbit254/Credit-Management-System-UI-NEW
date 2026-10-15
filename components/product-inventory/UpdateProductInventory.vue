<script lang="ts" setup>
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

// Only these can be set by hand (sales set the rest); the current status stays listed so other fields can be edited.
const statusLabels = computed(() => [...new Set(['InStock', 'ReturnedToSupplier', props.productInventory?.status].filter(Boolean))])

const selectedProduct = computed(() => props.productInventory)

const selectedSupplier = computed(() =>
  suppliers.value.find(s => s.supplier_uuid === localSupplierUuid.value),
)
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit device"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <!-- Only the serial number and status can change; the rest is fixed once the device is added. -->
      <VCol cols="12">
        <dl class="fixed-details text-body-1 mb-2">
          <dt>Product</dt>
          <dd>{{ selectedProduct?.product_name ?? '—' }} {{ selectedProduct?.product_brand }} {{ selectedProduct?.product_model_number }}</dd>
          <dt>Source</dt>
          <dd>{{ localSourceType || '—' }}</dd>
          <dt>Supplier</dt>
          <dd>{{ selectedSupplier?.supplier_name ?? '—' }}</dd>
        </dl>
      </VCol>

      <!-- Serial Number — editable -->
      <VCol cols="12">
        <AppTextField
          v-model="localSerialNumber"
          label="Serial Number*"
          placeholder="Enter serial number"
        />
      </VCol>

      <!-- Status — editable -->
      <VCol cols="12">
        <AppSelect
          v-model="localStatus"
          :items="statusLabels"
          label="Status*"
          placeholder="Select status"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>

<style scoped>
.fixed-details {
  display: grid;
  gap: 4px 16px;
  grid-template-columns: max-content 1fr;
}

.fixed-details dt { color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity)); }
.fixed-details dd { margin: 0; }
</style>
