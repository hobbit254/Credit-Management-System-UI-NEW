<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { type NewUser, NewUserSchema } from '@/schemas/users'
import type { Role } from '@/schemas/role'
import { useRoles } from '@/composables/roles/useRoles'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  user: NewUser
}>()

const emit = defineEmits(['update:modelValue', 'update:user', 'confirm'])

// UI State
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const fieldErrors = ref<Record<string, string[]>>({})
const roles = ref<Role[]>([])
const loadingRoles = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localUser = ref<NewUser>({ ...props.user })

// Sync logic
watch(() => props.user, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localUser.value))
    localUser.value = { ...newVal }
}, { deep: true })

watch(localUser, newVal => {
  emit('update:user', newVal)
}, { deep: true })

const { fetchAllActiveRoles } = useRoles()

onMounted(async () => {
  loadingRoles.value = true
  try {
    const data = await fetchAllActiveRoles()

    roles.value = data as unknown as Role[]
  }
  finally {
    loadingRoles.value = false
  }
})

function closeModal() {
  isOpen.value = false
  fieldErrors.value = {}
}

function handleConfirm() {
  const result = NewUserSchema.safeParse(localUser.value)
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }
  fieldErrors.value = {}
  emit('confirm', result.data)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="550"
    scrollable
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-user-plus</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New User</span>
          <span class="text-caption text-medium-emphasis">Create a new account and assign access</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Personal Information
              </p>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localUser.full_name"
                label="Full Name*"
                placeholder="John Doe"
                :error-messages="fieldErrors.full_name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localUser.email"
                label="Email Address*"
                type="email"
                placeholder="john@example.com"
                :error-messages="fieldErrors.email"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-mail
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-4"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Access Control
              </p>
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="localUser.role_uuid"
                :items="roles"
                item-title="role_name"
                item-value="roles_uuid"
                :loading="loadingRoles"
                label="Assigned Role*"
                placeholder="Select a role"
                :error-messages="fieldErrors.role_uuid"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-shield-lock
                  </VIcon>
                </template>
              </AppSelect>
            </VCol>

            <VCol
              cols="12"
              class="mt-4"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Security
              </p>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localUser.password"
                label="Password*"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="new-password"
                :error-messages="fieldErrors.password"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-lock
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localUser.password_confirmation"
                label="Confirm Password*"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                autocomplete="new-password"
                :error-messages="fieldErrors.password_confirmation"
                :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-lock-check
                  </VIcon>
                </template>
              </AppTextField>
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
          Create User
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
/* Removed var(--v-theme-...) to prevent CSS resolution errors */
.v-card-text {
  background-color: rgb(var(--v-theme-surface, 255,255,255)) !important;
}
</style>
