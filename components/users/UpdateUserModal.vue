<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { User } from '@/schemas/users'
import { useRoles } from '@/composables/roles/useRoles'
import type { Role } from '@/schemas/role'

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
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit user"
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
        />
      </VCol>

      <VCol
        cols="12"
        class="mt-4"
      >
        <AppSelect
          v-model="localRoleUuid"
          :items="roles"
          item-title="role_name"
          item-value="roles_uuid"
          :loading="loadingRoles"
          label="Assigned Role*"
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
    </VRow>
  </FormDialog>
</template>
