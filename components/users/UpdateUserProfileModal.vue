<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { User } from '@/schemas/users'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  user: User | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Local editable copies
const localFullName = ref('')
const localEmail = ref('')
const localPassword = ref('')
const localPasswordConfirmation = ref('')
const localCurrentPassword = ref('')
const isPasswordVisible = ref(false)

// Shown only: people can't change their own role.
const roleName = computed(() => props.user?.roles?.[0]?.role_name ?? '')

watch(
  () => props.user,
  newUser => {
    if (newUser) {
      localFullName.value = newUser.full_name
      localEmail.value = newUser.email
      localPassword.value = '' // Reset password fields on user change
      localPasswordConfirmation.value = ''
      localCurrentPassword.value = ''
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.user)
    return

  // Saved through users/me: only name, email and password, and a new password needs the current one.
  const profile: Record<string, string> = { full_name: localFullName.value, email: localEmail.value }

  if (localPassword.value) {
    profile.password = localPassword.value
    profile.password_confirmation = localPasswordConfirmation.value
    profile.current_password = localCurrentPassword.value
  }

  emit('confirm', profile)
}
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit your profile"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localFullName"
          label="Full Name*"
          placeholder="John Doe"
        />
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
        />
      </VCol>

      <VCol
        cols="12"
        class="mt-4"
      >
        <AppTextField
          :model-value="roleName"
          label="Assigned Role"
          hint="Ask an administrator to change your role."
          persistent-hint
          readonly
        />
      </VCol>

      <VCol
        cols="12"
        class="mt-4"
      >
        <AppTextField
          v-model="localPassword"
          label="New password"
          hint="Leave blank to keep the current password."
          persistent-hint
          :type="isPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
        />
      </VCol>

      <template v-if="localPassword">
        <VCol cols="12">
          <AppTextField
            v-model="localPasswordConfirmation"
            label="Confirm New Password*"
            :type="isPasswordVisible ? 'text' : 'password'"
          />
        </VCol>
        <VCol cols="12">
          <AppTextField
            v-model="localCurrentPassword"
            label="Current Password*"
            hint="Needed to set a new password."
            persistent-hint
            type="password"
          />
        </VCol>
      </template>
    </VRow>
  </FormDialog>
</template>
