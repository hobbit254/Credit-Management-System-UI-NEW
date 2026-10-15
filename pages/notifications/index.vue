<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Notification } from '@/schemas/notifications'
import { useNotifications } from '@/composables/notifications/useNotification'

definePageMeta({
  subject: 'v1/notifications',
})

const { notifications, loading, pagination, unreadCount, fetchNotifications, markAsRead } = useNotifications()

const isDrawerOpen = ref(false)
const selectedNotification = ref<Notification | null>(null)

async function openNotification(notification: Notification) {
  selectedNotification.value = notification
  isDrawerOpen.value = true
  if (!notification.read)
    await markAsRead(notification.notification_uuid)
}

const when = (date: string) => new Date(date).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(() => fetchNotifications(1))
</script>

<template>
  <ListPage
    title="Notifications"
    :subtitle="unreadCount ? `${unreadCount} unread. Open one to mark it read.` : 'All read.'"
    :loading="loading"
    :pagination="pagination"
    :row-count="notifications.length"
    :columns="2"
    empty-text="Nothing yet. Overdue credit warnings and import results show up here."
    @page="fetchNotifications"
  >
    <template #head>
      <th>Notification</th>
      <th>Received</th>
    </template>

    <tr
      v-for="notification in notifications"
      :key="notification.notification_uuid"
    >
      <td class="py-3">
        <div class="d-flex align-baseline gap-2">
          <span
            v-if="!notification.read"
            class="unread-dot"
            aria-hidden="true"
          />
          <a
            href="#"
            class="text-body-1 text-high-emphasis"
            :class="{ 'font-weight-bold': !notification.read }"
            @click.prevent="openNotification(notification)"
          >
            {{ notification.title }}<span
              v-if="!notification.read"
              class="d-sr-only"
            >, unread</span>
          </a>
        </div>
        <div class="text-body-2 text-medium-emphasis message">
          {{ notification.message }}
        </div>
      </td>
      <td class="text-body-2 text-medium-emphasis text-no-wrap">
        {{ when(notification.created_at) }}
      </td>
    </tr>
  </ListPage>

  <NotificationDetailDrawer
    v-model:model-value="isDrawerOpen"
    :notification="selectedNotification"
  />
</template>

<style scoped>
.unread-dot {
  flex: none;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  block-size: 8px;
  inline-size: 8px;
}

.message {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  max-inline-size: 80ch;
}
</style>
