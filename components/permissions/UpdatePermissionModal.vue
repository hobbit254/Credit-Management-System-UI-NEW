<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { Permission } from '@/schemas/permissions'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  permission: Permission | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Local editable copy
const localPermission = ref<Partial<Permission>>({
  permission_name: '',
  description: '',
  permission_action: '',
})

// Sync local state when the prop changes
watch(
  () => props.permission,
  newPermission => {
    if (newPermission)
      localPermission.value = { ...newPermission }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.permission)
    return

  emit('confirm', {
    ...localPermission.value,
    permission_uuid: props.permission.permission_uuid,
  })
}

const permissionActionItems = [
  { title: 'READ (GET)', value: 'GET' },
  { title: 'UPDATE (PUT)', value: 'PUT' },
  { title: 'CREATE (POST)', value: 'POST' },
  { title: 'DELETE (DELETE)', value: 'DELETE' },
]
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit permission"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localPermission.permission_name"
          label="Display Name*"
          placeholder="Enter permission name"
          autofocus
        />
      </VCol>

      <VCol cols="12">
        <AppSelect
          v-model="localPermission.permission_action"
          :items="permissionActionItems"
          label="Action*"
          placeholder="Select HTTP Verb"
        />
      </VCol>

      <VCol cols="12">
        <AppTextarea
          v-model="localPermission.description"
          label="Capability Description"
          placeholder="What does this permission allow users to do?"
          auto-grow
          rows="2"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
