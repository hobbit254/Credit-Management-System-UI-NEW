<script setup lang="ts">
import type { Product } from '@/schemas/products'

const props = defineProps<{
  loading: boolean
  product: Product | null
}>()

const emit = defineEmits<{ confirm: [product: Product] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.product)
    emit('confirm', props.product)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.product?.product_name ?? 'this'}?`"
    description="Its devices stop appearing on new sales. You can restore it from the Products list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
