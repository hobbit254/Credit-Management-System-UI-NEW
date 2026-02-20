import { computed, ref } from 'vue'
import type { AxiosInstance } from 'axios'
import type { NotificationList, Pagination } from '@/schemas/notifications'
import { useAlert } from '@/composables/alerts/useAlert'

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

export const useNotifications = () => {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const { alert: showToast } = useAlert()

  // ── Computed ───────────────────────────────────────────────────────────────

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length,
  )

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read),
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.read),
  )

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await $api.get('notifications', { params: { page } })

      // data.data is a tuple: [Notification[], PaginationMeta]
      const [items, meta] = data.data

      notifications.value = Array.isArray(items) ? items : []
      if (meta)
        pagination.value = meta
      showToast({
        title: 'Notifications',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
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
    }
    catch (err) {

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
    unreadNotifications,
    readNotifications,

    // Actions
    fetchNotifications,
    markAsRead,
  }
}
