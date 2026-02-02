<script setup lang="ts">
import { computed } from 'vue'
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

function closeModal() {
  isOpen.value = false
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="400"
  >
    <VCard title="Delete User">
      <VCardText>
        <p class="text-body-2">
          Are you sure you want to delete
          <strong>{{ props.user?.full_name }}</strong>?
        </p>
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
          color="error"
          text="Delete"
          :loading="props.loading"
          @click="$emit('confirm', props.user)"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
