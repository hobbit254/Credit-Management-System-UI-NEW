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

function closeModal() {
  isOpen.value = false
}

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
  <VDialog
    v-model="isOpen"
    max-width="550"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-shield-check</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Update Role Details</span>
          <span class="text-caption text-medium-emphasis">Modify name and description for this role</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol
              cols="12"
              class="mb-4"
            >
              <div class="d-flex align-center justify-space-between pa-3 rounded bg-var-theme-background border-dashed">
                <div class="d-flex align-center ga-2">
                  <VIcon
                    size="16"
                    color="secondary"
                  >
                    tabler-lock
                  </VIcon>
                  <span class="text-caption font-weight-bold text-uppercase">Role Slug</span>
                </div>
                <code class="text-primary font-weight-bold">{{ props.role?.role_slug }}</code>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Display Name
              </p>
              <AppTextField
                v-model="localRole.role_name"
                label="Role Name*"
                placeholder="Enter role name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-cog
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-2"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Role Description
              </p>
              <AppTextarea
                v-model="localRole.description"
                label="Description"
                placeholder="Briefly describe the purpose of this role..."
                auto-grow
                rows="3"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-align-left
                  </VIcon>
                </template>
              </AppTextarea>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VSpacer />
        <VBtn
          variant="plain"
          prepend-icon="tabler-x"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-refresh"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Update Role
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
