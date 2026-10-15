<script setup lang="ts">
import type { ProductInventory } from '@/schemas/productInventory'

const props = defineProps<{
  loading: boolean
  productInventory: ProductInventory | null
}>()

const emit = defineEmits<{ confirm: [productInventory: ProductInventory] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.productInventory)
    emit('confirm', props.productInventory)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Remove ${props.productInventory?.serial_number ?? 'this'}?`"
    description="It leaves stock and can't be sold. A device on a sale can't be removed until it's returned. You can restore it from the Devices list."
    confirm-text="Remove"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
