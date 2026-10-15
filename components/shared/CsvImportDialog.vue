<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ title: string; hint: string; loading: boolean }>()

const emit = defineEmits<{ upload: [file: File] }>()
const isOpen = defineModel<boolean>({ required: true })
const file = ref<File | null>(null)

function upload() {
  if (file.value)
    emit('upload', file.value)
  file.value = null
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="500"
  >
    <VCard class="pa-2">
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardText>
        <p class="text-body-1 mb-4">
          {{ hint }}
        </p>
        <VFileInput
          v-model="file"
          label="CSV file"
          accept=".csv"
          prepend-icon="tabler-upload"
          show-size
          :loading="loading"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          color="default"
          :disabled="loading"
          @click="isOpen = false"
        >
          Cancel
        </VBtn>
        <VBtn
          variant="flat"
          :disabled="!file"
          :loading="loading"
          @click="upload"
        >
          Import
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
