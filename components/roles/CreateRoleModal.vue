<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type NewRole } from '~/schemas/role'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  role: NewRole
}>()

const emit = defineEmits(['update:modelValue', 'update:role', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localRole = ref<NewRole>({ ...props.role })

// Sync local state with prop updates
watch(() => props.role, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localRole.value))
    localRole.value = { ...newVal }
}, { deep: true })

// Emit local changes back to parent
watch(localRole, newVal => {
  emit('update:role', newVal)
}, { deep: true })

function handleConfirm() {
  emit('confirm')
}

// Generate a slug preview based on the role name
const slugPreview = computed(() => {
  return localRole.value.role_name
    ?.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '') || 'role-slug'
})
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Add a role"
    description="Then choose what it may do under Who can do what."
    confirm-text="Add role"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localRole.role_name"
          label="Role Name*"
          placeholder="e.g. Warehouse Manager"
          :hint="slugPreview ? `Saved as ${slugPreview}` : undefined"
          persistent-hint
          autofocus
        />
      </VCol>

      <VCol cols="12">
        <AppTextarea
          v-model="localRole.description"
          label="Description"
          placeholder="Describe what users with this role can do..."
          auto-grow
          rows="3"
        />
      </VCol>

      <VCol
        cols="12"
        class="mt-2"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          New roles have no permissions by default. You will need to assign permissions after creation.
        </p>
      </VCol>
    </VRow>
  </FormDialog>
</template>
