<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUsers } from '@/composables/users/useUsers'
import UpdateUserProfileModal from '@/components/users/UpdateUserProfileModal.vue'

const { updateProfile, fetchActiveUser, activeUser, loading: saving } = useUsers()

const isEditOpen = ref(false)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await fetchActiveUser()
  }
  finally {
    loading.value = false
  }
})

const day = (date: string) => new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })

// Saves through users/me, so every role can edit their own profile. The dialog closes only on success;
// the toast shows the server's answer either way (e.g. a wrong current password).
async function handleUserUpdate(updatedData: Record<string, string>) {
  if (!await updateProfile(updatedData))
    return
  isEditOpen.value = false
  await fetchActiveUser()
}
</script>

<template>
  <VProgressLinear
    v-if="loading"
    indeterminate
    color="primary"
  />

  <div v-else-if="activeUser">
    <header class="d-flex flex-wrap align-end gap-4 mb-6">
      <div class="flex-grow-1">
        <h1 class="text-h2 mb-1">
          {{ activeUser.full_name }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Your profile. Only you can change your name, email or password here.
        </p>
      </div>
      <VBtn
        prepend-icon="tabler-edit"
        @click="isEditOpen = true"
      >
        Edit profile
      </VBtn>
    </header>

    <VRow>
      <VCol
        cols="12"
        md="7"
      >
        <VCard
          border
          flat
          class="pa-6 h-100"
        >
          <h2 class="text-h5 mb-4">
            Your details
          </h2>
          <dl class="details text-body-1">
            <dt>Name</dt>
            <dd>{{ activeUser.full_name }}</dd>
            <dt>Email</dt>
            <dd>
              {{ activeUser.email }}
              <span
                class="text-body-2 ms-2"
                :class="activeUser.email_verified_at ? 'text-medium-emphasis' : 'text-warning font-weight-medium'"
              >
                {{ activeUser.email_verified_at ? 'Verified' : 'Not verified yet' }}
              </span>
            </dd>
            <dt>Role</dt>
            <dd>{{ activeUser.roles?.[0]?.role_name ?? 'No role' }}</dd>
            <dt>Member since</dt>
            <dd>{{ day(activeUser.created_at) }}</dd>
          </dl>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="5"
      >
        <VCard
          border
          flat
          class="pa-6 h-100"
        >
          <h2 class="text-h5 mb-2">
            Password
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            To change it you need your current password. If you've forgotten it, ask an administrator to set a new one.
          </p>
          <VBtn
            variant="outlined"
            color="default"
            prepend-icon="tabler-key"
            @click="isEditOpen = true"
          >
            Change password
          </VBtn>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <UpdateUserProfileModal
    v-model:model-value="isEditOpen"
    :user="activeUser"
    :loading="saving"
    @confirm="handleUserUpdate"
  />
</template>

<style scoped>
.details {
  display: grid;
  gap: 12px 24px;
  grid-template-columns: max-content 1fr;
  margin: 0;
}

.details dt { color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity)); }
.details dd { margin: 0; overflow-wrap: anywhere; }
</style>
