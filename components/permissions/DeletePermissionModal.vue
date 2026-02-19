<script setup lang="ts">
import { computed } from 'vue'
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

function handleConfirm() {
  if (props.permission)
    emit('confirm', props.permission)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="450"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="error"
          variant="tonal"
          size="40"
        >
          <VIcon color="error">
            tabler-lock-off
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Delete Permission</span>
          <span class="text-caption text-error font-weight-medium">Access Control Risk</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Are you sure you want to delete this permission? This action will immediately revoke this capability from all associated roles.
        </p>

        <VCard
          variant="flat"
          color="secondary-lighten-5"
          class="border pa-4 rounded-lg"
        >
          <div class="d-flex flex-column ga-3">
            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Permission</span>
              <div class="d-flex align-center ga-2">
                <VChip
                  size="x-small"
                  variant="flat"
                  :color="props.permission?.permission_action === 'POST' ? 'success' : 'info'"
                  label
                  class="font-weight-bold"
                >
                  {{ props.permission?.permission_action }}
                </VChip>
                <span class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ props.permission?.permission_name }}
                </span>
              </div>
            </div>

            <VDivider />

            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">System Slug</span>
              <code class="text-error font-weight-bold text-xs">
                {{ props.permission?.permission_slug }}
              </code>
            </div>
          </div>
        </VCard>

        <VAlert
          color="error"
          variant="tonal"
          density="compact"
          class="mt-4"
          border="start"
        >
          <template #prepend>
            <VIcon size="20">
              tabler-alert-triangle
            </VIcon>
          </template>
          <span class="text-caption">
            Existing roles linked to this permission will lose this access rule.
          </span>
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn
          variant="plain"
          prepend-icon="tabler-arrow-left"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>

        <VBtn
          color="error"
          variant="elevated"
          prepend-icon="tabler-trash"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Confirm Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
