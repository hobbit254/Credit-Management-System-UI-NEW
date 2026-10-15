<script lang="ts" setup>
import type { Notification } from '@/schemas/notifications'
import { dateTime, itemStatusLabel } from '@/utils/formatters'

const props = defineProps<{
  notification: Notification | null
}>()

const isOpen = defineModel<boolean>({ required: true })

// Overdue warnings carry the sale's items; import results carry counts.
const items = computed(() => Array.isArray(props.notification?.details) ? props.notification.details : [])
const counts = computed(() => props.notification?.details && !Array.isArray(props.notification.details) ? props.notification.details : null)
</script>

<template>
  <VNavigationDrawer
    v-model="isOpen"
    temporary
    location="end"
    :width="420"
  >
    <div
      v-if="notification"
      class="pa-6"
    >
      <div class="d-flex justify-space-between align-start gap-2 mb-1">
        <h2 class="text-h4">
          {{ notification.title }}
        </h2>
        <VBtn
          aria-label="Close"
          icon="tabler-x"
          variant="text"
          color="default"
          @click="isOpen = false"
        />
      </div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ dateTime(notification.created_at) }}
      </p>
      <p class="text-body-1 mb-6">
        {{ notification.message }}
      </p>

      <template v-if="items.length">
        <h3 class="text-h6 mb-2">
          Items on the sale
        </h3>
        <div
          v-for="item in items"
          :key="item.transaction_item_uuid"
          class="item d-flex justify-space-between py-3 text-body-1"
        >
          <span>KES {{ Number(item.unit_price).toLocaleString('en-KE') }}</span>
          <span class="text-medium-emphasis">{{ itemStatusLabel(item.status) }}</span>
        </div>
      </template>

      <p
        v-if="counts"
        class="text-body-1"
      >
        {{ counts.imported }} imported, {{ counts.skipped }} skipped.
      </p>
    </div>
  </VNavigationDrawer>
</template>

<style scoped>
.item { border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
</style>
