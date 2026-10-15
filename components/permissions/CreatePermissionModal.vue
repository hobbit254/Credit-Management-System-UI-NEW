<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { NewPermission } from '@/schemas/permissions'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  permission: NewPermission
}>()

const emit = defineEmits(['update:modelValue', 'update:permission', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localPermission = ref<NewPermission>({ ...props.permission })

// Sync local state with prop updates
watch(() => props.permission, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localPermission.value))
    localPermission.value = { ...newVal }
}, { deep: true })

// Emit local changes back to parent
watch(localPermission, newVal => {
  emit('update:permission', newVal)
}, { deep: true })

function handleConfirm() {
  emit('confirm')
}

const permissionActionItems = [
  { title: 'READ (GET)', value: 'GET', icon: 'tabler-eye' },
  { title: 'UPDATE (PUT)', value: 'PUT', icon: 'tabler-edit' },
  { title: 'CREATE (POST)', value: 'POST', icon: 'tabler-plus' },
  { title: 'DELETE (DELETE)', value: 'DELETE', icon: 'tabler-trash' },
]
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Add a permission"
    description="One per API route. Give it to roles under Who can do what."
    confirm-text="Add permission"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localPermission.permission_name"
          label="Permission Name*"
          placeholder="e.g. Inventory Management"
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

      <VCol
        cols="12"
        class="mb-2"
      >
        <!-- The permission only works if this is a real API route for the action above -->
        <AppTextField
          v-model="localPermission.permission_slug"
          label="Route*"
          placeholder="e.g. v1/product-inventory/delete"
          hint="The API route this permission opens, exactly as the server has it."
          persistent-hint
          class="font-mono"
        />
      </VCol>

      <VCol cols="12">
        <AppTextarea
          v-model="localPermission.description"
          label="Description"
          placeholder="What exactly does this permission allow?"
          auto-grow
          rows="2"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
