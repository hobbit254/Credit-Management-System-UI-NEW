<script setup lang="ts">
import { ref } from 'vue'
import { type NewUser, NewUserSchema } from '@/schemas/users'
import type { Role } from '@/schemas/role'
import { useRoles } from '@/composables/roles/useRoles'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  user: NewUser
}>()

const emit = defineEmits(['update:modelValue', 'update:user', 'confirm'])
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localUser = ref<NewUser>({ ...props.user })

watch(() => props.user, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localUser.value))
    localUser.value = { ...newVal }
}, { deep: true })

watch(localUser, newVal => {
  emit('update:user', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

const fieldErrors = ref<Record<string, string[]>>({})

function handleConfirm() {
  const result = NewUserSchema.safeParse(localUser.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}

const { fetchAllActiveRoles } = useRoles()
const roles = ref<Role[]>([])
const loadingRoles = ref(false)

onMounted(async () => {
  loadingRoles.value = true
  try {
    const data = await fetchAllActiveRoles()

    roles.value = data as unknown as Role[]
    console.log('Roles loaded:', roles.value)
  }
  finally {
    loadingRoles.value = false
  }
})
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-user"
      title="Add New User"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localUser.full_name"
                label="Full Name*"
                placeholder="Enter full name"
                :error-messages="fieldErrors.full_name"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="localUser.role_uuid"
                :items="roles"
                item-title="role_name"
                item-value="roles_uuid"
                :loading="loadingRoles"
                label="User Role*"
                placeholder="Select user role"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localUser.email"
                label="Email"
                type="email"
                placeholder="Enter users email"
                :error-messages="fieldErrors.email"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localUser.password"
                label="Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="password"
                :error-messages="fieldErrors.password"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localUser.password_confirmation"
                label="Confirm Password"
                autocomplete="confirm-password"
                :error-messages="fieldErrors.password_confirmation"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          text="Cancel"
          variant="plain"
          @click="closeModal"
        />

        <VBtn
          color="primary"
          text="Save"
          variant="tonal"
          :loading="props.loading"
          @click="handleConfirm"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
