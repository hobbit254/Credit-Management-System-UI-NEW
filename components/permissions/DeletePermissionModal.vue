<script setup lang="ts">
import type { Permission } from '@/schemas/permissions'

const props = defineProps<{
  loading: boolean
  permission: Permission | null
}>()

const emit = defineEmits<{ confirm: [permission: Permission] }>()
const isOpen = defineModel<boolean>({ required: true })

function handleConfirm() {
  if (props.permission)
    emit('confirm', props.permission)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    :title="`Archive ${props.permission?.permission_name ?? 'this'}?`"
    description="No role gets it while it's archived. You can restore it from the Permissions list."
    confirm-text="Archive"
    danger
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
