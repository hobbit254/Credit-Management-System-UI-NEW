<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { Role } from '@/schemas/role'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  role: Role | null
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
const localRoleName = ref('')
const localDescription = ref('')

watch(
  () => props.role,
  newRole => {
    if (newRole) {
      localRoleName.value = newRole.role_name
      localDescription.value = newRole.description
    }
  },
  { immediate: true, deep: true },
)

function handleConfirm() {
  if (!props.role)
    return
  emit('confirm', {
    roles_uuid: props.role.roles_uuid,
    role_name: localRoleName.value,
    description: localDescription.value,
  })
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Edit Role Details"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <VTextField
                v-model="localRoleName"
                label="Role Name*"
                placeholder="Enter role name"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="localDescription"
                label="Description"
                placeholder="Enter role description"
                auto-grow
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
          text="Update"
          variant="tonal"
          :loading="props.loading"
          @click="handleConfirm"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
