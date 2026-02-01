<script setup lang="ts">
import { ref } from 'vue'
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

watch(() => props.permission, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localPermission.value))
    localPermission.value = { ...newVal }
}, { deep: true })

watch(localPermission, newVal => {
  emit('update:permission', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

function handleConfirm() {
  emit('confirm')
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
      title="Add New Permission"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <VTextField
                v-model="localPermission.permission_name"
                label="Permission Name*"
                placeholder="Enter permission name"
                required
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="localPermission.permission_action"
                :items="permissionActionItems"
                label="Permission Action*"
                placeholder="Enter permission action"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="localPermission.description"
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
