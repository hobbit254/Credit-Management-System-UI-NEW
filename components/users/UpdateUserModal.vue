<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
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

function closeModal() {
  isOpen.value = false
}

// Local editable copies
const localFullName = ref('')
const localEmail = ref('')
const localPassword = ref('')
const localRoleUuid = ref('')

watch(
  () => props.user,
  newUser => {
    if (newUser) {
      localFullName.value = newUser.full_name
      localEmail.value = newUser.email
      localRoleUuid.value = newUser.roles[0]?.roles_uuid || ''
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
  })
}

const { fetchAllActiveRoles } = useRoles()
const roles = ref<Role[]>([])
const loadingRoles = ref(false)

onMounted(async () => {
  loadingRoles.value = true
  try {
    roles.value = await fetchAllActiveRoles()
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
      prepend-icon="tabler-shield-lock"
      title="Update User"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localFullName"
                label="Full Name*"
                placeholder="Enter full name"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="localRoleUuid"
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
                v-model="localEmail"
                label="Email"
                type="email"
                placeholder="Enter users email"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localPassword"
                label="Password"
                type="password"
                placeholder="Enter users password"
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
