<script setup lang="ts">
import type { Supplier } from '@/schemas/suppliers'

const props = defineProps<{
  loading: boolean
  supplier: Supplier | null
}>()

const emit = defineEmits<{ confirm: [supplier: Supplier] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.supplier)
    emit('confirm', props.supplier)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.supplier?.supplier_shop_name ?? 'this'}?`"
    description="You can restore it from the Suppliers list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
