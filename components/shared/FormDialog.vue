<!-- The redesigned pop-up: a title, optional explanation, the fields, and Cancel plus one action. Enter submits. -->
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  loading?: boolean
  confirmText: string
  danger?: boolean // the action can't be taken back, or takes something away
  width?: number
  hideConfirm?: boolean // for pop-ups that only show information
}>()

const emit = defineEmits<{ confirm: [] }>()
const isOpen = defineModel<boolean>({ required: true })
</script>

<template>
  <VDialog
    v-model="isOpen"
    :max-width="width ?? 520"
    scrollable
  >
    <VCard
      border
      flat
    >
      <VForm
        class="d-flex flex-column"
        style="max-block-size: inherit;"
        @submit.prevent="emit('confirm')"
      >
        <VCardTitle class="pt-6 px-6 pb-0 text-wrap">
          <h2 class="text-h4">
            {{ title }}
          </h2>
        </VCardTitle>
        <VCardText class="px-6 pt-2 pb-2">
          <p
            v-if="description"
            class="text-body-1 text-medium-emphasis mb-5"
          >
            {{ description }}
          </p>
          <slot />
        </VCardText>
        <VCardActions class="px-6 pb-6 pt-2 gap-2">
          <VSpacer />
          <VBtn
            variant="text"
            color="default"
            :disabled="loading"
            @click="isOpen = false"
          >
            {{ hideConfirm ? 'Close' : 'Cancel' }}
          </VBtn>
          <VBtn
            v-if="!hideConfirm"
            type="submit"
            variant="flat"
            :color="danger ? 'error' : 'primary'"
            :loading="loading"
          >
            {{ confirmText }}
          </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>
