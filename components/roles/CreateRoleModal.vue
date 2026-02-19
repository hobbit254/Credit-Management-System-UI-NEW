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

function closeModal() {
  isOpen.value = false
}

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
          <VIcon>tabler-shield-plus</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New Role</span>
          <span class="text-caption text-medium-emphasis">Define system access levels and permissions</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Role Identity
              </p>
              <AppTextField
                v-model="localRole.role_name"
                label="Role Name*"
                placeholder="e.g. Warehouse Manager"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-check
                  </VIcon>
                </template>
              </AppTextField>
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
                  tabler-link
                </VIcon>
                <span class="text-caption text-medium-emphasis">
                  System Slug: <code class="text-primary font-weight-bold">{{ slugPreview }}</code>
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Access Description
              </p>
              <AppTextarea
                v-model="localRole.description"
                label="Description"
                placeholder="Describe what users with this role can do..."
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

            <VCol
              cols="12"
              class="mt-2"
            >
              <VAlert
                color="warning"
                variant="tonal"
                density="compact"
                class="text-caption"
                border="start"
              >
                <template #prepend>
                  <VIcon size="18">
                    tabler-alert-circle
                  </VIcon>
                </template>
                New roles have no permissions by default. You will need to assign permissions after creation.
              </VAlert>
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
          Create Role
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
