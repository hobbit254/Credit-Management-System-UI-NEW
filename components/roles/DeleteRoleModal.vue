<script setup lang="ts">
import { computed } from 'vue'
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

function closeModal() {
  isOpen.value = false
}

function handleConfirm() {
  if (props.role)
    emit('confirm', props.role)
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
            tabler-shield-x
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Delete System Role</span>
          <span class="text-caption text-error font-weight-medium">Critical Security Action</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Are you sure you want to delete this role? Users assigned to this role will lose their associated permissions immediately.
        </p>

        <VCard
          variant="flat"
          color="secondary-lighten-5"
          class="border pa-4 rounded-lg"
        >
          <div class="d-flex flex-column ga-3">
            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Role Name</span>
              <div class="d-flex align-center ga-2">
                <VAvatar
                  size="24"
                  color="error"
                  variant="tonal"
                >
                  <span class="text-xxs font-weight-bold">
                    {{ props.role?.role_name?.charAt(0)?.toUpperCase() ?? '?' }}
                  </span>
                </VAvatar>
                <span class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ props.role?.role_name ?? 'N/A' }}
                </span>
              </div>
            </div>

            <VDivider />

            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis">System Slug</span>
              <VChip
                size="x-small"
                color="error"
                variant="tonal"
                label
                class="font-weight-bold"
              >
                {{ props.role?.role_slug ?? '—' }}
              </VChip>
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
              tabler-alert-octagon
            </VIcon>
          </template>
          <span class="text-caption font-weight-medium">
            Warning: This may disrupt access for active users.
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
          Back
        </VBtn>

        <VBtn
          color="error"
          variant="elevated"
          prepend-icon="tabler-trash"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Confirm Deletion
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.text-xxs {
  font-size: 0.65rem;
}
</style>
