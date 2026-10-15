<script setup lang="ts">
import { ref } from 'vue'
import { type NewProduct, NewProductSchema } from '@/schemas/products'
import { useCategory } from '@/composables/categories/useCategory'
import type { Category } from '@/schemas/category'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  product: NewProduct
}>()

const emit = defineEmits(['update:modelValue', 'update:product', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localProduct = ref<NewProduct>({ ...props.product })

watch(() => props.product, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localProduct.value))
    localProduct.value = { ...newVal }
}, { deep: true })

watch(localProduct, newVal => {
  emit('update:product', newVal)
}, { deep: true })

const fieldErrors = ref<Record<string, string[]>>({})

function handleConfirm() {
  const result = NewProductSchema.safeParse(localProduct.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}

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
    title="Add a product"
    description="A model you sell. Add each unit of it under Devices."
    confirm-text="Add product"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <!-- Product Name -->
      <VCol cols="12">
        <AppTextField
          v-model="localProduct.product_name"
          label="Product Name*"
          placeholder="Enter product name"
          :error-messages="fieldErrors.product_name"
        />
      </VCol>

      <!-- Brand & Model side by side -->
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localProduct.product_brand"
          label="Brand*"
          placeholder="Enter brand"
          :error-messages="fieldErrors.product_brand"
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
          :error-messages="fieldErrors.product_model_number"
        />
      </VCol>

      <!-- Category -->
      <VCol cols="12">
        <AppSelect
          v-model="localProduct.category_uuid"
          :items="categories"
          item-title="category_name"
          item-value="category_uuid"
          label="Category*"
          :loading="loadingCategories"
          placeholder="Select a category"
          :error-messages="fieldErrors.category_uuid"
        />
      </VCol>

      <!-- Default Price -->
      <VCol cols="12">
        <AppTextField
          v-model="localProduct.default_price"
          label="Default Price*"
          type="number"
          placeholder="Enter default price"
          :error-messages="fieldErrors.default_price"
          prefix="KES"
        />
      </VCol>

      <!-- Price Preview -->
      <VCol
        v-if="localProduct.default_price"
        cols="12"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          Default price set to KES {{ Number(localProduct.default_price).toLocaleString() }}
        </p>
      </VCol>
    </VRow>
  </FormDialog>
</template>
