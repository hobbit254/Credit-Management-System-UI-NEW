<script setup lang="ts">
import type { User } from '@/schemas/users'

const props = defineProps<{
  loading: boolean
  user: User | null
}>()

const emit = defineEmits<{ confirm: [user: User] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.user)
    emit('confirm', props.user)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.user?.full_name ?? 'this'}?`"
    description="They can no longer sign in. You can restore them from the Users list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
