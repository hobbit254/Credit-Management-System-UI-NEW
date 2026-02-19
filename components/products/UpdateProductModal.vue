<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
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

function closeModal() {
  isOpen.value = false
}

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
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-edit</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Edit Product</span>
          <span class="text-caption text-medium-emphasis">Update product details and pricing</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Product Name
              </p>
              <AppTextField
                v-model="localProduct.product_name"
                label="Product Name*"
                placeholder="Enter product name"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-box
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Brand
              </p>
              <AppTextField
                v-model="localProduct.product_brand"
                label="Brand*"
                placeholder="Enter brand"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-building-factory
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Model Number
              </p>
              <AppTextField
                v-model="localProduct.product_model_number"
                label="Model Number*"
                placeholder="Enter model number"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-barcode
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Category
              </p>
              <AppSelect
                v-model="localProduct.category_uuid"
                :items="categories"
                item-title="category_name"
                item-value="category_uuid"
                label="Category Type*"
                :loading="loadingCategories"
                placeholder="Select a category"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-tag
                  </VIcon>
                </template>
                <template #item="{ item, props: itemProps }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <VAvatar
                        size="26"
                        color="info"
                        variant="tonal"
                      >
                        <span class="text-caption font-weight-bold">
                          {{ item.raw.category_name?.charAt(0)?.toUpperCase() ?? '?' }}
                        </span>
                      </VAvatar>
                    </template>
                  </VListItem>
                </template>
              </AppSelect>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Default Price
              </p>
              <AppTextField
                v-model="localProduct.default_price"
                label="Default Price*"
                type="number"
                placeholder="Enter default price"
              >
                <template #prepend-inner>
                  <span class="text-caption font-weight-bold text-success pt-1">KES</span>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              v-if="localProduct.default_price"
              cols="12"
            >
              <VAlert
                color="info"
                variant="tonal"
                density="compact"
              >
                <template #prepend>
                  <VIcon color="info">
                    tabler-info-circle
                  </VIcon>
                </template>
                Updating price to <strong>KES {{ Number(localProduct.default_price).toLocaleString() }}</strong>
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
          Update Product
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
