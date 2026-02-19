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

function closeModal() {
  isOpen.value = false
}

function handleConfirm() {
  emit('confirm')
}

// Generate a slug preview based on name and action
const slugPreview = computed(() => {
  const name = localPermission.value.permission_name
    ?.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '') || 'permission'

  const action = localPermission.value.permission_action?.toLowerCase() || 'action'

  return `${name}:${action}`
})

const permissionActionItems = [
  { title: 'READ (GET)', value: 'GET', icon: 'tabler-eye' },
  { title: 'UPDATE (PUT)', value: 'PUT', icon: 'tabler-edit' },
  { title: 'CREATE (POST)', value: 'POST', icon: 'tabler-plus' },
  { title: 'DELETE (DELETE)', value: 'DELETE', icon: 'tabler-trash' },
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
          <VIcon>tabler-lock-plus</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New Permission</span>
          <span class="text-caption text-medium-emphasis">Define granular access control rules</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Permission Identity
              </p>
              <AppTextField
                v-model="localPermission.permission_name"
                label="Permission Name*"
                placeholder="e.g. Inventory Management"
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

            <VCol
              cols="12"
              class="mb-2"
            >
              <div class="d-flex align-center ga-2 px-3 py-2 rounded bg-var-theme-background border-dashed">
                <VIcon
                  size="14"
                  color="secondary"
                >
                  tabler-key
                </VIcon>
                <span class="text-caption text-medium-emphasis">
                  Resulting Slug: <code class="text-primary font-weight-bold">{{ slugPreview }}</code>
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Capability Description
              </p>
              <AppTextarea
                v-model="localPermission.description"
                label="Description"
                placeholder="What exactly does this permission allow?"
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
          prepend-icon="tabler-check"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Create Permission
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
