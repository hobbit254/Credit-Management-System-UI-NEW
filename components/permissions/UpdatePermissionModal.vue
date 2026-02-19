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
          <VIcon>tabler-lock-cog</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Update Permission</span>
          <span class="text-caption text-medium-emphasis">Modify access rules and capabilities</span>
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
              <div class="pa-3 rounded bg-var-theme-background border-dashed">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">System Slug</span>
                  <code class="text-primary font-weight-bold text-xs">{{ props.permission?.permission_slug }}</code>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">Internal UUID</span>
                  <span class="text-xxs font-mono text-medium-emphasis">{{ props.permission?.permission_uuid }}</span>
                </div>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Permission Label
              </p>
              <AppTextField
                v-model="localPermission.permission_name"
                label="Display Name*"
                placeholder="Enter permission name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-shield-check
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Authorized Action
              </p>
              <AppSelect
                v-model="localPermission.permission_action"
                :items="permissionActionItems"
                label="Action*"
                placeholder="Select HTTP Verb"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-api-app
                  </VIcon>
                </template>
              </AppSelect>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Description
              </p>
              <AppTextarea
                v-model="localPermission.description"
                label="Capability Description"
                placeholder="What does this permission allow users to do?"
                auto-grow
                rows="2"
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
          Update Permission
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.text-xxs {
  font-size: 0.65rem;
}
</style>
