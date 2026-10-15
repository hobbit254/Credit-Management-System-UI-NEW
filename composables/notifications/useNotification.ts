import { computed, ref } from 'vue'
import type { ApiClient } from '@/types/api'
import type { NotificationList, Pagination } from '@/schemas/notifications'

// Shared by the navbar bell and the notifications page: all of the user's unread notifications,
// as counted by the server (not just one page's).
const unreadTotal = ref(0)

// Called on logout so the next user never sees the previous user's count. Each list lives in
// the component that uses it, so it goes away with that component.
export function clearNotifications() {
  unreadTotal.value = 0
}

export const useNotifications = () => {
  const { $api } = useNuxtApp() as unknown as { $api: ApiClient }

  // Per caller: the bell polls page 1 every minute, and must not overwrite the page someone is reading.
  const notifications = ref<NotificationList>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref<Pagination>({
    perPage: 10,
    currentPage: 1,
    total: 0,
    lastPage: 1,
    from: 1,
    to: 0,
    nextPageUrl: null,
    hasMorePages: false,
  })

  // ── Computed ───────────────────────────────────────────────────────────────

  const unreadCount = computed(() => unreadTotal.value)

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await $api.get('notifications', { params: { page } })

      // data.data is a tuple: [Notification[], PaginationMeta]
      const [items, meta] = data.data

      notifications.value = Array.isArray(items) ? items : []
      if (meta) {
        pagination.value = meta
        unreadTotal.value = meta.unreadCount ?? notifications.value.filter(n => !n.read).length
      }
    }
    catch (err: any) {
      error.value = err?.message ?? 'Failed to load notifications'
    }
    finally {
      loading.value = false
    }
  }

  // ── Mark single notification as read ──────────────────────────────────────

  const markAsRead = async (notificationUuid: string) => {
    const notification = notifications.value.find(
      n => n.notification_uuid === notificationUuid,
    )

    // Already read — skip API call
    if (!notification || notification.read)
      return

    try {
      await $api.put('notifications/read', {
        notification_uuid: notificationUuid,
      })

      // Optimistically update locally
      notification.read = true
      notification.read_at = new Date().toISOString()
      unreadTotal.value = Math.max(0, unreadTotal.value - 1)
    }
    catch {
      // The API plugin already showed why it failed.
    }
  }

  return {
    // State
    notifications,
    loading,
    error,
    pagination,

    // Computed
    unreadCount,

    // Actions
    fetchNotifications,
    markAsRead,
  }
}
