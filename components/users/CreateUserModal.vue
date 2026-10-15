<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

// Load each time the dialog opens: the page mounts it once, so loading on mount kept
// lists from when the page opened (e.g. a unit sold a minute ago still offered).
watch(() => props.modelValue, async open => {
  if (!open)
    return
  loadingRoles.value = true
  try {
    const data = await fetchAllActiveRoles()

    roles.value = data as unknown as Role[]
  }
  finally {
    loadingRoles.value = false
  }
}, { immediate: true })

// Clear old errors once the pop-up has closed.
watch(isOpen, open => {
  if (!open)
    fieldErrors.value = {}
})

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
  <FormDialog
    v-model="isOpen"
    title="Add a user"
    description="We email them a link to verify their address."
    confirm-text="Add user"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <VCol cols="12">
        <AppTextField
          v-model="localUser.full_name"
          label="Full Name*"
          placeholder="John Doe"
          :error-messages="fieldErrors.full_name"
          autofocus
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="localUser.email"
          label="Email Address*"
          type="email"
          placeholder="john@example.com"
          :error-messages="fieldErrors.email"
        />
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
        />
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
        />
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
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
