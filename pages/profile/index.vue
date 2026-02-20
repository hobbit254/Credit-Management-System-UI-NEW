<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUsers } from '@/composables/users/useUsers'
import UpdateUserProfileModal from "@/components/users/UpdateUserProfileModal.vue";

const { showToast, updateUser, fetchActiveUser, activeUser } = useUsers()

// Dialog Controls
const isUserInfoEditDialogVisible = ref(false)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await fetchActiveUser()
  loading.value = false
})

// Formatting Helpers
const avatarText = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'

const resolveUserStatusVariant = (status: number) => {
  if (status === 1)
    return { color: 'success', text: 'Active' }

  return { color: 'secondary', text: 'Inactive' }
}

// Logic for User Update
const handleUserUpdate = async (updatedData: any) => {
  try {
    await updateUser(updatedData)
    isUserInfoEditDialogVisible.value = false // close modal
    await fetchActiveUser() // refresh data
    showToast({
      title: 'Success',
      text: 'Profile updated successfully',
      color: 'success',
    })
  }
  catch (error) {

  }
}
</script>

<template>
  <VProgressLinear
    v-if="loading"
    indeterminate
    color="primary"
  />

  <VRow v-else-if="activeUser">
    <VCol cols="12">
      <VCard>
        <VCardText class="text-center pt-12">
          <VAvatar
            rounded
            size="120"
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <span class="text-4xl font-weight-medium">
              {{ avatarText(activeUser.full_name) }}
            </span>
          </VAvatar>

          <h5 class="text-h5">
            {{ activeUser.full_name }}
          </h5>

          <VChip
            label
            color="primary"
            size="small"
            class="text-capitalize mt-3 px-4"
          >
            {{ activeUser.roles?.[0]?.role_name || 'Standard User' }}
          </VChip>
        </VCardText>

        <VCardText>
          <div class="d-flex justify-space-around gap-x-6 gap-y-2 flex-wrap mb-6">
            <div class="d-flex align-center me-8">
              <VAvatar
                :size="40"
                rounded
                color="primary"
                variant="tonal"
                class="me-4"
              >
                <VIcon
                  icon="tabler-shield-check"
                  size="24"
                />
              </VAvatar>
              <div>
                <h5 class="text-h5">
                  Verified
                </h5>
                <span class="text-sm">{{ activeUser.email_verified_at ? 'Identity Confirmed' : 'Pending' }}</span>
              </div>
            </div>

            <div class="d-flex align-center me-4">
              <VAvatar
                :size="38"
                rounded
                color="success"
                variant="tonal"
                class="me-4"
              >
                <VIcon
                  icon="tabler-activity"
                  size="24"
                />
              </VAvatar>
              <div>
                <h5 class="text-h5">
                  {{ resolveUserStatusVariant(activeUser.active).text }}
                </h5>
                <span class="text-sm">Current State</span>
              </div>
            </div>
          </div>

          <h5 class="text-h5">
            Details
          </h5>
          <VDivider class="my-4" />

          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Account ID:
                  <div class="d-inline-block text-body-1 font-mono text-xs">
                    {{ activeUser.user_uuid }}
                  </div>
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <span class="text-h6">Email: </span>
                <span class="text-body-1">{{ activeUser.email }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Verification Status:
                  <VIcon
                    :icon="activeUser.email_verified_at ? 'tabler-circle-check' : 'tabler-circle-x'"
                    :color="activeUser.email_verified_at ? 'success' : 'warning'"
                    size="18"
                    class="ms-2"
                  />
                </h6>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Member Since:
                  <div class="d-inline-block text-body-1">
                    <TableDate :value="activeUser.created_at" />
                  </div>
                </h6>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>

        <VCardText class="d-flex justify-center gap-x-4">
          <VBtn
            variant="elevated"
            prepend-icon="tabler-edit"
            @click="isUserInfoEditDialogVisible = true"
          >
            Edit Profile
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard
        border
        class="border-dashed"
      >
        <VCardText>
          <div class="d-flex align-center justify-space-between mb-4">
            <h6 class="text-h6">
              Security Strength
            </h6>
            <VChip
              label
              color="info"
              size="x-small"
            >
              System Verified
            </VChip>
          </div>

          <div class="mb-6">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-sm">Password Reliability</span>
              <span class="text-sm font-weight-bold">85%</span>
            </div>
            <VProgressLinear
              rounded
              height="8"
              :model-value="85"
              color="success"
            />
            <p class="text-caption mt-2">
              Last password change: <TableDate :value="activeUser.updated_at" />
            </p>
          </div>

          <VBtn
            block
            variant="tonal"
            prepend-icon="tabler-key"
            @click="isUserInfoEditDialogVisible = true"
          >
            Reset Credentials
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <UpdateUserProfileModal
    v-model:model-value="isUserInfoEditDialogVisible"
    :user="activeUser"
    :loading="loading"
    @confirm="handleUserUpdate"
  />
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.75rem;
}
.font-mono {
  font-family: 'Fira Code', monospace;
}
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), 0.4) !important;
}
</style>
