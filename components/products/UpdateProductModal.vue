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

// Local editable copy (initialized with safe defaults)
const localProduct = ref<Partial<Product>>({})

// Keep local state in sync with prop when modal opens/prop changes
watch(
  () => props.product,
  newProduct => {
    if (newProduct)
      localProduct.value = { ...newProduct }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.product)
    return

  // Emit the merged local changes
  emit('confirm', {
    ...localProduct.value,
    product_uuid: props.product.product_uuid,
  })
}

// Category Fetching Logic
const { fetchAllActiveCategories } = useCategory()
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// Load each time the dialog opens: the page mounts it once, so loading on mount kept
// lists from when the page opened (e.g. a unit sold a minute ago still offered).
watch(() => props.modelValue, async open => {
  if (!open)
    return
  loadingCategories.value = true
  try {
    const data = await fetchAllActiveCategories()

    categories.value = data as unknown as Category[]
  }
  finally {
    loadingCategories.value = false
  }
}, { immediate: true })
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit product"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localProduct.product_name"
          label="Product Name*"
          placeholder="Enter product name"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localProduct.product_brand"
          label="Brand*"
          placeholder="Enter brand"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localProduct.product_model_number"
          label="Model Number*"
          placeholder="Enter model number"
        />
      </VCol>

      <VCol cols="12">
        <AppSelect
          v-model="localProduct.category_uuid"
          :items="categories"
          item-title="category_name"
          item-value="category_uuid"
          label="Category Type*"
          :loading="loadingCategories"
          placeholder="Select a category"
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="localProduct.default_price"
          label="Default Price*"
          type="number"
          placeholder="Enter default price"
          prefix="KES"
        />
      </VCol>

      <VCol
        v-if="localProduct.default_price"
        cols="12"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          Updating price to KES {{ Number(localProduct.default_price).toLocaleString() }}
        </p>
      </VCol>
    </VRow>
  </FormDialog>
</template>
