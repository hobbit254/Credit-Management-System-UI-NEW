<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { Role } from '@/schemas/role'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  role: Role | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Local editable copy
const localRole = ref<Partial<Role>>({
  role_name: '',
  description: '',
})

// Sync local state when the prop changes
watch(
  () => props.role,
  newRole => {
    if (newRole)
      localRole.value = { ...newRole }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.role)
    return

  emit('confirm', {
    ...localRole.value,
    roles_uuid: props.role.roles_uuid,
  })
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit role"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localRole.role_name"
          label="Role Name*"
          placeholder="Enter role name"
          autofocus
        />
      </VCol>

      <VCol
        cols="12"
        class="mt-2"
      >
        <AppTextarea
          v-model="localRole.description"
          label="Description"
          placeholder="Briefly describe the purpose of this role..."
          auto-grow
          rows="3"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
