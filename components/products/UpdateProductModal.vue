<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import type { Product } from '@/schemas/products'
import { useCategory } from '@/composables/categories/useCategory'
import type { Category } from '@/schemas/category'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  product: Product | null
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
const localProductName = ref('')
const localProductModelNumber = ref('')
const localProductBrand = ref('')
const localCategoryUuid = ref('')
const localDefaultPrice = ref<number>(0)

watch(
  () => props.product,
  newProduct => {
    if (newProduct) {
      localProductName.value = newProduct.product_name
      localProductModelNumber.value = newProduct.product_model_number
      localProductBrand.value = newProduct.product_brand
      localCategoryUuid.value = newProduct.category_uuid
      localDefaultPrice.value = newProduct.default_price
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.product)
    return
  emit('confirm', {
    product_uuid: props.product.product_uuid,
    product_name: localProductName.value,
    product_model_number: localProductModelNumber.value,
    product_brand: localProductBrand.value,
    category_uuid: localCategoryUuid.value,
    default_price: localDefaultPrice.value,
  })
}
const { fetchAllActiveCategories } = useCategory()
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

onMounted(async () => {
  loadingCategories.value = true
  try {
    const data = await fetchAllActiveCategories()

    categories.value = data as unknown as Category[]
  }
  finally {
    loadingCategories.value = false
  }
})
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
              <AppTextField
                v-model="localProductName"
                label="Product Name*"
                placeholder="Enter Product Name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localProductModelNumber"
                label="Product Model Number*"
                placeholder="Enter Product Model Number"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localProductBrand"
                label="Product Brand*"
                placeholder="Enter Product Brand"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="localCategoryUuid"
                :items="categories"
                item-title="category_name"
                item-value="category_uuid"
                label="Category Type*"
                :loading="loadingCategories"
                placeholder="Select a Product Category*"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localDefaultPrice"
                label="Default Price*"
                type="number"
                placeholder="Enter Default Price"
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
