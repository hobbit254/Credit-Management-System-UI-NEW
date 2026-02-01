<script setup lang="ts">
import { ref } from 'vue'
import { type NewRole } from '~/schemas/role'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  role: NewRole
}>()

const emit = defineEmits(['update:modelValue', 'update:role', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localRole = ref<NewRole>({ ...props.role })

watch(() => props.role, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localRole.value))
    localRole.value = { ...newVal }
}, { deep: true })

watch(localRole, newVal => {
  emit('update:role', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Add New Role"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <VTextField
                v-model="localRole.role_name"
                label="Role Name*"
                placeholder="Enter role name"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="localRole.description"
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
          text="Save"
          variant="tonal"
          :loading="props.loading"
          @click="handleConfirm"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
