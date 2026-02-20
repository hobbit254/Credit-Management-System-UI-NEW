<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import type { User } from '@/schemas/users'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  user: User | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

function closeModal() {
  isOpen.value = false
}

function handleConfirm() {
  if (props.user)
    emit('confirm', props.user)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="480"
    persistent
  >
    <VCard
      class="border-t-lg border-error shadow-xl"
      :style="{ backgroundColor: surfaceColor }"
    >
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="error"
          variant="tonal"
          size="44"
          rounded="lg"
        >
          <VIcon size="24">
            tabler-user-off
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-black text-error">Terminate User Access</span>
          <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-widest">
            Identity & Access Security
          </span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <p class="text-body-2 text-high-emphasis mb-5">
          You are about to revoke all system access for this user. This action will archive their profile and terminate all active sessions immediately.
        </p>

        <VCard
          variant="flat"
          class="pa-4 rounded-lg border-dashed bg-light-error"
        >
          <div class="d-flex align-center ga-3 mb-4">
            <VAvatar
              size="46"
              color="error"
              variant="elevated"
              class="shadow-sm border border-white"
            >
              <span class="text-h6 font-weight-bold text-white">
                {{ props.user?.full_name?.charAt(0) }}
              </span>
            </VAvatar>

            <div class="d-flex flex-column overflow-hidden">
              <span class="text-body-1 font-weight-black text-high-emphasis text-truncate">
                {{ props.user?.full_name }}
              </span>
              <div class="d-flex align-center ga-1">
                <VIcon
                  size="12"
                  color="medium-emphasis"
                >
                  tabler-fingerprint
                </VIcon>
                <span class="text-xxs font-mono text-medium-emphasis text-truncate">
                  {{ props.user?.user_uuid }}
                </span>
              </div>
            </div>
          </div>

          <VDivider class="mb-4 border-opacity-25" />

          <div class="d-flex justify-space-between align-end">
            <div class="d-flex flex-column ga-1">
              <span class="text-xxs text-uppercase font-weight-black text-disabled tracking-widest">Registered Email</span>
              <span class="text-caption font-weight-bold text-medium-emphasis font-mono">
                {{ props.user?.email || 'N/A' }}
              </span>
            </div>
            <VChip
              size="x-small"
              color="error"
              variant="flat"
              label
              class="font-weight-black text-uppercase"
            >
              {{ props.user?.roles?.[0]?.role_name || 'Standard User' }}
            </VChip>
          </div>
        </VCard>

        <VAlert
          type="error"
          variant="tonal"
          density="compact"
          class="mt-5 rounded-lg border-none"
        >
          <template #prepend>
            <VIcon size="20">
              tabler-shield-lock
            </VIcon>
          </template>
          <span class="text-caption font-weight-medium">
            This account will be moved to the "Archived" state. Audit logs associated with this user will be preserved.
          </span>
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 bg-var-theme-background">
        <VBtn
          variant="text"
          color="secondary"
          class="font-weight-bold"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>
        <VSpacer />
        <VBtn
          color="error"
          variant="elevated"
          min-width="150"
          :loading="props.loading"
          @click="handleConfirm"
        >
          <VIcon start>
            tabler-trash-x
          </VIcon>
          Confirm Removal
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-t-lg {
  border-top: 6px solid rgb(var(--v-theme-error,255,255,255)) !important;
}

.border-dashed {
  border: 1px dashed rgba(var(--v-theme-error,255,255,255), 0.3) !important;
}

.bg-light-error {
  background-color: rgba(var(--v-theme-error,255,255,255), 0.04) !important;
}

.text-xxs {
  font-size: 0.65rem;
}

.font-mono {
  font-family: 'Fira Code', 'Roboto Mono', monospace;
}

.tracking-widest {
  letter-spacing: 0.12em;
}

.v-card {
  border-radius: 12px !important;
}
</style>
