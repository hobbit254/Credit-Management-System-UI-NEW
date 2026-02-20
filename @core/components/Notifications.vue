<script lang="ts" setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { formatTimeAgo } from '@/utils/formatters'
import { useNotifications } from '@/composables/notifications/useNotification'

const {
  notifications,
  loading,
  unreadCount,
  fetchNotifications,
  markAsRead,
} = useNotifications()

// 👉 Computed property to limit records
const limitedNotifications = computed(() => {
  return notifications.value.slice(0, 10)
})

// Fetch on mount
onMounted(() => {
  fetchNotifications()
})

// UI State Logic
const isAllMarkRead = computed(() => unreadCount.value === 0)
const router = useRouter()

// Handle clicking a single notification
const handleNotificationClick = async (notification: any) => {
  if (!notification.read)
    await markAsRead(notification.notification_uuid)
}
</script>

<template>
  <IconBtn id="notification-btn">
    <VBadge
      :model-value="unreadCount > 0"
      :content="unreadCount"
      color="error"
      offset-x="2"
      offset-y="3"
    >
      <VIcon icon="tabler-bell" />
    </VBadge>

    <VMenu
      activator="parent"
      width="380px"
      location="bottom end"
      offset="12px"
      :close-on-content-click="false"
    >
      <VCard
        class="d-flex flex-column"
        :loading="loading"
      >
        <VCardItem class="notification-section">
          <VCardTitle class="text-h6">
            Notifications
          </VCardTitle>

          <template #append>
            <VChip
              v-show="unreadCount > 0"
              size="small"
              color="primary"
              class="me-2"
            >
              {{ unreadCount }} New
            </VChip>

            <IconBtn
              v-show="notifications.length"
              size="34"
            >
              <VIcon
                size="20"
                color="high-emphasis"
                :icon="isAllMarkRead ? 'tabler-mail-opened' : 'tabler-mail'"
              />
              <VTooltip
                activator="parent"
                location="start"
              >
                {{ isAllMarkRead ? 'All caught up!' : '' }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="max-block-size: 23.75rem;"
        >
          <VList class="notification-list rounded-0 py-0">
            <template
              v-for="(notification, index) in limitedNotifications"
              :key="notification.notification_uuid"
            >
              <VDivider v-if="index > 0" />
              <VListItem
                link
                min-height="66px"
                :class="{ 'bg-lighter': !notification.read }"
                class="list-item-hover-class"
                @click="handleNotificationClick(notification)"
              >
                <div class="d-flex align-start gap-3">
                  <VAvatar
                    :color="notification.read ? 'secondary' : 'primary'"
                    variant="tonal"
                    rounded
                  >
                    <VIcon
                      size="18"
                      :icon="notification.read ? 'tabler-bell-check' : 'tabler-bell-ringing'"
                    />
                  </VAvatar>

                  <div class="flex-grow-1">
                    <p
                      class="text-sm font-weight-medium mb-1"
                      :class="{ 'text-primary': !notification.read }"
                    >
                      {{ notification.title }}
                    </p>
                    <p class="text-body-2 mb-2 text-wrap line-clamp-2">
                      {{ notification.message }}
                    </p>
                    <p class="text-xs text-disabled mb-0">
                      {{ formatTimeAgo(notification.created_at) }}
                    </p>
                  </div>

                  <div class="d-flex flex-column align-end">
                    <VIcon
                      size="10"
                      icon="tabler-circle-filled"
                      :color="!notification.read ? 'primary' : '#a8aaae'"
                      :class="{ 'visible-in-hover': notification.read }"
                      class="mb-2"
                    />
                  </div>
                </div>
              </VListItem>
            </template>

            <VListItem
              v-show="!notifications.length && !loading"
              class="text-center text-medium-emphasis"
              style="block-size: 56px;"
            >
              <VListItemTitle>No Notifications Found!</VListItemTitle>
            </VListItem>
          </VList>
        </PerfectScrollbar>

        <VDivider />

        <VCardText
          v-show="notifications.length"
          class="pa-4"
        >
          <VBtn
            block
            variant="tonal"
            size="small"
            @click="router.push('/notifications')"
          >
            View All Notifications
          </VBtn>
        </VCardText>
      </VCard>
    </VMenu>
  </IconBtn>
</template>
