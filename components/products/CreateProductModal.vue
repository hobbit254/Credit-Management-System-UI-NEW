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
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localProduct.value))
    localProduct.value = { ...newVal }
}, { deep: true })

watch(localProduct, newVal => {
  emit('update:product', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

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
      prepend-icon="tabler-user"
      title="Add New Product"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localProduct.product_name"
                label="Product Name*"
                placeholder="Enter Product Name"
                :error-messages="fieldErrors.product_name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localProduct.product_model_number"
                label="Product Model Number*"
                placeholder="Enter Product Model Number"
                :error-messages="fieldErrors.product_model_number"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localProduct.product_brand"
                label="Product Brand*"
                placeholder="Enter Product Brand"
                :error-messages="fieldErrors.product_brand"
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
                placeholder="Select a Product Category*"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localProduct.default_price"
                label="Default Price*"
                type="number"
                placeholder="Enter Default Price"
                :error-messages="fieldErrors.default_price"
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
