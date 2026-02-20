import { z } from 'zod'

// ── Notification Detail Item (matches API response) ────────────────────────────

export const NotificationDetailSchema = z.object({
  transaction_item_uuid: z.uuid(),
  unit_price: z.number(),
  source_type: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type NotificationDetail = z.infer<typeof NotificationDetailSchema>

// ── Single Notification ────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
  notification_uuid: z.uuid(),
  user_id: z.number(),
  title: z.string(),
  message: z.string(),
  details: z.array(NotificationDetailSchema),
  read: z.boolean(),
  read_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  full_name: z.string(),
  email: z.email(),
})
export type Notification = z.infer<typeof NotificationSchema>

// ── Notification List ──────────────────────────────────────────────────────────

export const NotificationListSchema = z.array(NotificationSchema)
export type NotificationList = z.infer<typeof NotificationListSchema>

// ── Pagination ─────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  perPage: z.number(),
  currentPage: z.number(),
  total: z.number(),
  lastPage: z.number(),
  from: z.number(),
  to: z.number(),
  nextPageUrl: z.string().nullable(),
  hasMorePages: z.boolean(),
})
export type Pagination = z.infer<typeof PaginationSchema>
