<script setup lang="ts">
import type { Debtor } from '@/schemas/debtors'

const props = defineProps<{
  loading: boolean
  debtor: Debtor | null
}>()

const emit = defineEmits<{ confirm: [debtor: Debtor] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.debtor)
    emit('confirm', props.debtor)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.debtor?.debtor_name ?? 'this'}?`"
    description="They can no longer be picked for new sales. Someone who still owes money can't be archived. You can restore them from the Debtors list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
