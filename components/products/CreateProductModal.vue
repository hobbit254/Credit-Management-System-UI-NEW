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
          <VIcon>tabler-box</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New Product</span>
          <span class="text-caption text-medium-emphasis">Fill in the product details below</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <!-- Product Name -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                PRODUCT NAME
              </p>
              <AppTextField
                v-model="localProduct.product_name"
                label="Product Name*"
                placeholder="Enter product name"
                :error-messages="fieldErrors.product_name"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-box
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <!-- Brand & Model side by side -->
            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                BRAND
              </p>
              <AppTextField
                v-model="localProduct.product_brand"
                label="Brand*"
                placeholder="Enter brand"
                :error-messages="fieldErrors.product_brand"
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
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                MODEL NUMBER
              </p>
              <AppTextField
                v-model="localProduct.product_model_number"
                label="Model Number*"
                placeholder="Enter model number"
                :error-messages="fieldErrors.product_model_number"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-barcode
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <!-- Category -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                CATEGORY
              </p>
              <AppSelect
                v-model="localProduct.category_uuid"
                :items="categories"
                item-title="category_name"
                item-value="category_uuid"
                label="Category*"
                :loading="loadingCategories"
                placeholder="Select a category"
                :error-messages="fieldErrors.category_uuid"
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

            <!-- Default Price -->
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                DEFAULT PRICE
              </p>
              <AppTextField
                v-model="localProduct.default_price"
                label="Default Price*"
                type="number"
                placeholder="Enter default price"
                :error-messages="fieldErrors.default_price"
              >
                <template #prepend-inner>
                  <span class="text-caption font-weight-bold text-success pt-1">KES</span>
                </template>
              </AppTextField>
            </VCol>

            <!-- Price Preview -->
            <VCol
              v-if="localProduct.default_price"
              cols="12"
            >
              <VAlert
                color="success"
                variant="tonal"
                density="compact"
              >
                <template #prepend>
                  <VIcon color="success">
                    tabler-circle-check
                  </VIcon>
                </template>
                Default price set to
                <strong>KES {{ Number(localProduct.default_price).toLocaleString() }}</strong>
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
          Save Product
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
