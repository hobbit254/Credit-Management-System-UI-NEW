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

function closeModal() {
  isOpen.value = false
}

// Local editable copies
const localPermissionName = ref('')
const localDescription = ref('')
const localPermissionAction = ref('')

watch(
  () => props.permission,
  newPermission => {
    if (newPermission) {
      localPermissionName.value = newPermission.permission_name
      localDescription.value = newPermission.description
      localPermissionAction.value = newPermission.permission_action
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.permission)
    return
  emit('confirm', {
    permission_uuid: props.permission.permission_uuid,
    permission_name: localPermissionName.value,
    description: localDescription.value,
    permission_action: localPermissionAction.value,
  })
}
const permissionActionItems = ['GET', 'PUT', 'POST']
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Update Permission"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <VTextField
                v-model="localPermissionName"
                label="Permission Name*"
                placeholder="Enter permission name"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="localPermissionAction"
                :items="permissionActionItems"
                label="Permission Action*"
                placeholder="Enter permission action"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="localDescription"
                label="Description"
                placeholder="Enter permission description"
                auto-grow
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          text="Cancel"
          variant="plain"
          @click="closeModal"
        />

        <VBtn
          color="primary"
          text="Save"
          variant="tonal"
          :loading="props.loading"
          @click="handleConfirm"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
