<script setup lang="ts">
import type { Category } from '@/schemas/category'

const props = defineProps<{
  loading: boolean
  category: Category | null
}>()

const emit = defineEmits<{ confirm: [category: Category] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.category)
    emit('confirm', props.category)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.category?.category_name ?? 'this'}?`"
    description="Its products stop appearing on new sales. You can restore it from the Categories list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
