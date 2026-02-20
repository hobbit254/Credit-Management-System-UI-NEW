<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import type { User } from '@/schemas/users'
import { useRoles } from '@/composables/roles/useRoles'
import type { Role } from '@/schemas/role'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  user: User | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

// Theme logic for CSS variable safety
const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

function closeModal() {
  isOpen.value = false
}

// Local editable copies
const localFullName = ref('')
const localEmail = ref('')
const localPassword = ref('')
const localRoleUuid = ref('')
const isPasswordVisible = ref(false)

watch(
  () => props.user,
  newUser => {
    if (newUser) {
      localFullName.value = newUser.full_name
      localEmail.value = newUser.email
      localRoleUuid.value = newUser.roles?.[0]?.roles_uuid || ''
      localPassword.value = '' // Reset password field on user change
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.user)
    return

  emit('confirm', {
    user_uuid: props.user.user_uuid,
    full_name: localFullName.value,
    email: localEmail.value,
    role_uuid: localRoleUuid.value,
    ...(localPassword.value ? { password: localPassword.value } : {}),
  })
}

const { fetchAllActiveRoles } = useRoles()
const roles = ref<Role[]>([])
const loadingRoles = ref(false)

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
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="550"
    scrollable
    persistent
  >
    <VCard :style="{ backgroundColor: surfaceColor }">
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-user-cog</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Update Account</span>
          <span class="text-caption text-medium-emphasis">Modify user profile and system access</span>
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
                  <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">Internal UUID</span>
                  <span
                    class="text-xxs font-mono text-medium-emphasis text-truncate"
                    style="max-width: 200px;"
                  >
                    {{ props.user?.user_uuid }}
                  </span>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">Verification</span>
                  <VChip
                    size="x-small"
                    :color="props.user?.email_verified_at ? 'success' : 'warning'"
                    variant="tonal"
                    label
                  >
                    {{ props.user?.email_verified_at ? 'Verified' : 'Pending' }}
                  </VChip>
                </div>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Profile Information
              </p>
              <AppTextField
                v-model="localFullName"
                label="Full Name*"
                placeholder="John Doe"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-edit
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-2"
            >
              <AppTextField
                v-model="localEmail"
                label="Email Address*"
                type="email"
                placeholder="john@example.com"
                readonly
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
              <AppSelect
                v-model="localRoleUuid"
                :items="roles"
                item-title="role_name"
                item-value="roles_uuid"
                :loading="loadingRoles"
                label="Assigned Role*"
                readonly
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-shield-check
                  </VIcon>
                </template>
              </AppSelect>
            </VCol>

            <VCol
              cols="12"
              class="mt-4"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <p class="text-caption text-medium-emphasis font-weight-medium text-uppercase">
                  Security
                </p>
                <span class="text-xxs text-warning italic">Leave blank to keep current password</span>
              </div>
              <AppTextField
                v-model="localPassword"
                label="New Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-lock-password
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
          prepend-icon="tabler-refresh"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Update User
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

.italic {
  font-style: italic;
}
</style>
