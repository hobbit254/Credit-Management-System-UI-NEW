<script setup lang="ts">
import type { Role } from '@/schemas/role'

const props = defineProps<{
  loading: boolean
  role: Role | null
}>()

const emit = defineEmits<{ confirm: [role: Role] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.role)
    emit('confirm', props.role)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.role?.role_name ?? 'this'}?`"
    description="People with this role lose what it allows until it's restored. You can restore it from the Roles list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
