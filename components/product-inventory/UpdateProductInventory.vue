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

function closeModal() {
  isOpen.value = false
}

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

const statusLabels = statusOptions.map(s => s.label)

const selectedStatusOption = computed(() =>
  statusOptions.find(s => s.label === localStatus.value),
)

const selectedSourceOption = computed(() =>
  sourceTypeOptions.find(s => s.label === localSourceType.value),
)

const selectedProduct = computed(() => props.productInventory)

const selectedSupplier = computed(() =>
  suppliers.value.find(s => s.supplier_uuid === localSupplierUuid.value),
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
          color="warning"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-package</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Update Product Inventory</span>
          <span class="text-caption text-medium-emphasis">Edit the inventory details below</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <!-- Product — readonly display -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                PRODUCT
              </p>
              <VCard
                variant="outlined"
                class="pa-3 mb-2"
              >
                <div class="d-flex align-center ga-3">
                  <VAvatar
                    size="36"
                    color="primary"
                    variant="tonal"
                  >
                    <span class="text-caption font-weight-bold">
                      {{ selectedProduct?.product_name?.charAt(0)?.toUpperCase() ?? '?' }}
                    </span>
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <span class="font-weight-medium text-body-2">
                      {{ selectedProduct?.product_name ?? '—' }}
                    </span>
                    <div class="d-flex align-center ga-1 mt-1">
                      <VChip
                        v-if="selectedProduct?.product_brand"
                        size="x-small"
                        color="secondary"
                        variant="tonal"
                      >
                        {{ selectedProduct.product_brand }}
                      </VChip>
                      <VChip
                        v-if="selectedProduct?.product_model_number"
                        size="x-small"
                        color="info"
                        variant="tonal"
                      >
                        {{ selectedProduct.product_model_number }}
                      </VChip>
                    </div>
                  </div>
                  <VSpacer />
                  <VChip
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      size="11"
                    >
                      tabler-lock
                    </VIcon>
                    Read-only
                  </VChip>
                </div>
              </VCard>
            </VCol>

            <!-- Source Type — readonly display -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SOURCE TYPE
              </p>
              <VCard
                variant="outlined"
                class="pa-3 mb-2"
              >
                <div class="d-flex align-center ga-2">
                  <VIcon
                    :color="selectedSourceOption?.color"
                    size="18"
                  >
                    {{ selectedSourceOption?.icon ?? 'tabler-box' }}
                  </VIcon>
                  <span class="text-body-2 font-weight-medium">{{ localSourceType || '—' }}</span>
                  <VSpacer />
                  <VChip
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      size="11"
                    >
                      tabler-lock
                    </VIcon>
                    Read-only
                  </VChip>
                </div>
              </VCard>
            </VCol>

            <!-- Supplier — readonly display -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SUPPLIER
              </p>
              <VCard
                variant="outlined"
                class="pa-3 mb-2"
              >
                <div class="d-flex align-center ga-3">
                  <VAvatar
                    size="32"
                    color="warning"
                    variant="tonal"
                  >
                    <span class="text-caption font-weight-bold">
                      {{ selectedSupplier?.supplier_name?.charAt(0)?.toUpperCase() ?? '?' }}
                    </span>
                  </VAvatar>
                  <span class="text-body-2 font-weight-medium">
                    {{ selectedSupplier?.supplier_name ?? '—' }}
                  </span>
                  <VSpacer />
                  <VChip
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      size="11"
                    >
                      tabler-lock
                    </VIcon>
                    Read-only
                  </VChip>
                </div>
              </VCard>
            </VCol>

            <VDivider class="my-2" />

            <!-- Serial Number — editable -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SERIAL NUMBER
              </p>
              <AppTextField
                v-model="localSerialNumber"
                label="Serial Number*"
                placeholder="Enter serial number"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-hash
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <!-- Status — editable -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                STATUS
              </p>
              <AppSelect
                v-model="localStatus"
                :items="statusLabels"
                label="Status*"
                placeholder="Select status"
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

            <!-- Status Preview -->
            <VCol
              v-if="localStatus"
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
                Status set to <strong>{{ localStatus }}</strong>
              </VAlert>
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
          prepend-icon="tabler-check"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Save Changes
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
