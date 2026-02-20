<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Notification } from '@/schemas/notifications'
import { useNotifications } from '@/composables/notifications/useNotification'

const {
  notifications,
  loading,
  pagination,
  unreadCount,
  fetchNotifications,
  markAsRead,
} = useNotifications()

const isDrawerOpen = ref(false)
const selectedNotification = ref<Notification | null>(null)

const openNotification = async (notification: Notification) => {
  selectedNotification.value = notification
  isDrawerOpen.value = true
  if (!notification.read)
    await markAsRead(notification.notification_uuid)
}

const onPageChange = async (page: number) => {
  if (loading.value)
    return
  window.scrollTo({ top: 0, behavior: 'smooth' })
  await fetchNotifications(page)
}

onMounted(() => fetchNotifications(1))
</script>

<template>
  <VRow>
    <VCol cols="12">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h4 class="text-h4 mb-1">
            Notifications
          </h4>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Stay updated with your latest activities and alerts.
          </p>
        </div>

        <div class="d-flex align-center gap-2">
          <VChip
            v-if="unreadCount > 0"
            color="error"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ unreadCount }} New
          </VChip>
        </div>
      </div>

      <VCard
        v-if="notifications.length > 0"
        :loading="loading"
        class="notification-card"
        elevation="0"
        border
      >
        <VList
          lines="two"
          class="py-0"
        >
          <template
            v-for="(notification, index) in notifications"
            :key="notification.notification_uuid"
          >
            <VListItem
              class="notification-item py-4 px-6"
              :class="[
                { 'unread-item': !notification.read },
              ]"
              @click="openNotification(notification)"
            >
              <template #prepend>
                <VAvatar
                  :color="notification.read ? 'secondary' : 'primary'"
                  variant="tonal"
                  size="48"
                  class="me-1"
                >
                  <VIcon
                    size="24"
                    :icon="notification.read ? 'tabler-bell' : 'tabler-bell-ringing-filled'"
                  />
                </VAvatar>
              </template>

              <VListItemTitle
                class="text-h6 font-weight-semibold mb-1"
                :class="notification.read ? 'text-high-emphasis' : 'text-primary'"
              >
                {{ notification.title }}
              </VListItemTitle>

              <VListItemSubtitle class="text-body-2 text-medium-emphasis line-clamp-2">
                {{ notification.message }}
              </VListItemSubtitle>

              <template #append>
                <div class="d-flex flex-column align-end justify-center gap-2">
                  <span class="text-caption text-disabled">
                    <TableDate :value="notification.created_at" />
                  </span>

                  <VChip
                    :color="notification.read ? 'secondary' : 'primary'"
                    size="x-small"
                    variant="tonal"
                    label
                    class="text-uppercase font-weight-bold px-2"
                  >
                    {{ notification.read ? 'Read' : 'Unread' }}
                  </VChip>
                </div>
              </template>
            </VListItem>
            <VDivider v-if="index < notifications.length - 1" />
          </template>
        </VList>

        <VDivider />
        <div class="pagination-footer d-flex align-center justify-space-between px-6 py-4 flex-wrap gap-4">
          <div class="text-body-2 text-medium-emphasis">
            Showing <span class="font-weight-medium text-high-emphasis">{{ pagination?.from }}</span>
            to <span class="font-weight-medium text-high-emphasis">{{ pagination?.to }}</span>
            of <span class="font-weight-medium text-high-emphasis">{{ pagination?.total }}</span>
          </div>

          <VPagination
            v-if="pagination"
            :model-value="pagination.currentPage"
            :length="pagination.lastPage || 1"
            :total-visible="7"
            show-first-last-page
            size="small"
            rounded
            @update:model-value="onPageChange"
          />
        </div>
      </VCard>

      <VCard
        v-else-if="!loading"
        class="text-center py-12"
        variant="outlined"
        border
      >
        <VIcon
          size="64"
          icon="tabler-bell-off"
          color="disabled"
          class="mb-4"
        />
        <div class="text-h5 text-medium-emphasis">
          All caught up!
        </div>
        <p class="text-body-1 text-disabled">
          You have no new notifications.
        </p>
      </VCard>
    </VCol>
  </VRow>

  <NotificationDetailDrawer
    v-model:model-value="isDrawerOpen"
    :notification="selectedNotification"
  />
</template>

<style scoped lang="scss">
.notification-card {
  border-radius: 12px;
  overflow: hidden;
}

.notification-item {
  transition: all 0.2s ease-in-out;
  border-left: 4px solid transparent;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.02);
    cursor: pointer;
  }

  &.unread-item {
    background-color: rgba(var(--v-theme-primary), 0.03);
    border-left-color: rgb(var(--v-theme-primary));

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.06);
    }
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-footer {
  background-color: rgba(var(--v-theme-on-surface), 0.01);
}

:deep(.v-pagination__prev),
:deep(.v-pagination__next) {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
