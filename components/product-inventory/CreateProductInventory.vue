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

const sourceTypeOptions = [
  { label: 'Inventory', icon: 'tabler-building-warehouse', color: 'primary' },
  { label: 'Outsourced', icon: 'tabler-truck-delivery', color: 'warning' },
]

const statusOptions = [
  { label: 'InStock', icon: 'tabler-circle-check', color: 'success' },
  { label: 'Returned', icon: 'tabler-arrow-back-up', color: 'warning' },
  { label: 'ReturnedToSupplier', icon: 'tabler-arrow-forward-up', color: 'info' },
  { label: 'OnCredit', icon: 'tabler-clock', color: 'warning' },
  { label: 'Paid', icon: 'tabler-circle-check', color: 'success' },
  { label: 'Sold', icon: 'tabler-shopping-cart', color: 'secondary' },
]

const sourceTypeLabels = sourceTypeOptions.map(s => s.label)
const statusLabels = statusOptions.map(s => s.label)

const selectedStatusOption = computed(() =>
  statusOptions.find(s => s.label === localProductInventory.value.status),
)

const selectedSourceOption = computed(() =>
  sourceTypeOptions.find(s => s.label === localProductInventory.value.source_type),
)
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="620"
    scrollable
  >
    <VCard>
      <!-- Header -->
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-package</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add Product Inventory</span>
          <span class="text-caption text-medium-emphasis">Fill in the product inventory details</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <!-- Product -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                PRODUCT
              </p>
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
                <template #prepend-inner>
                  <VIcon
                    size="18"
                    class="mt-1"
                  >
                    tabler-box
                  </VIcon>
                </template>
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
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SERIAL NUMBER
              </p>
              <AppTextField
                v-model="localProductInventory.serial_number"
                label="Serial Number*"
                placeholder="Enter serial number"
                :error-messages="fieldErrors.serial_number"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-hash
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <!-- Source Type -->
            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SOURCE TYPE
              </p>
              <AppSelect
                v-model="localProductInventory.source_type"
                :items="sourceTypeLabels"
                label="Source Type*"
                placeholder="Select source type"
                :error-messages="fieldErrors.source_type"
              >
                <template #prepend-inner>
                  <VIcon
                    size="18"
                    :color="selectedSourceOption?.color"
                  >
                    {{ selectedSourceOption?.icon ?? 'tabler-box' }}
                  </VIcon>
                </template>
                <template #item="{ item, props: itemProps }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <VIcon
                        :color="sourceTypeOptions.find(s => s.label === item.raw)?.color"
                        size="18"
                      >
                        {{ sourceTypeOptions.find(s => s.label === item.raw)?.icon }}
                      </VIcon>
                    </template>
                  </VListItem>
                </template>
              </AppSelect>
            </VCol>

            <!-- Status -->
            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                STATUS
              </p>
              <AppSelect
                v-model="localProductInventory.status"
                :items="statusLabels"
                label="Status*"
                placeholder="Select status"
                :error-messages="fieldErrors.status"
              >
                <template #prepend-inner>
                  <VIcon
                    size="18"
                    :color="selectedStatusOption?.color"
                  >
                    {{ selectedStatusOption?.icon ?? 'tabler-circle' }}
                  </VIcon>
                </template>
                <template #item="{ item, props: itemProps }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <VIcon
                        :color="statusOptions.find(s => s.label === item.raw)?.color"
                        size="18"
                      >
                        {{ statusOptions.find(s => s.label === item.raw)?.icon }}
                      </VIcon>
                    </template>
                  </VListItem>
                </template>
              </AppSelect>
            </VCol>

            <!-- Current Status Preview -->
            <VCol
              v-if="localProductInventory.status"
              cols="12"
            >
              <VAlert
                :color="selectedStatusOption?.color"
                variant="tonal"
                density="compact"
              >
                <template #prepend>
                  <VIcon :color="selectedStatusOption?.color">
                    {{ selectedStatusOption?.icon }}
                  </VIcon>
                </template>
                Status set to <strong>{{ localProductInventory.status }}</strong>
              </VAlert>
            </VCol>

            <!-- Supplier -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SUPPLIER
              </p>
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
              >
                <template #prepend-inner>
                  <VIcon
                    size="18"
                    class="mt-1"
                  >
                    tabler-building-store
                  </VIcon>
                </template>
                <template #item="{ item, props: itemProps }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <VAvatar
                        size="28"
                        color="warning"
                        variant="tonal"
                      >
                        <span class="text-caption font-weight-bold">
                          {{ item.raw.supplier_name?.charAt(0)?.toUpperCase() ?? '?' }}
                        </span>
                      </VAvatar>
                    </template>
                  </VListItem>
                </template>
              </VAutocomplete>
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
          @click="closeModal"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-check"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
