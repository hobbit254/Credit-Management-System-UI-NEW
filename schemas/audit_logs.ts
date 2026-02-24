import { z } from 'zod'

// ── Audit Log Internal Payload ──────────────────────────────────────────────
/**
 * Represents the 'payload' object nested inside 'details'
 */
export const AuditLogInternalPayloadSchema = z.object({
  page: z.string().optional(),
})
export type AuditLogInternalPayload = z.infer<typeof AuditLogInternalPayloadSchema>

// ── Audit Log Details ───────────────────────────────────────────────────────
/**
 * Represents the 'details' object containing metadata about the request
 */
export const AuditLogDetailsSchema = z.object({
  ip: z.string(),
  email: z.email(),
  token: z.string(),
  payload: AuditLogInternalPayloadSchema,
  user_id: z.number(),
  userAgent: z.string(),
})
export type AuditLogDetails = z.infer<typeof AuditLogDetailsSchema>

// ── Single Audit Log Entry ──────────────────────────────────────────────────
/**
 * The primary schema for a single Audit Log entry
 */
export const AuditLogSchema = z.object({
  action: z.string(), // e.g., "NotificationsController.all"
  entity: z.string(), // e.g., "notifications"
  entity_id: z.number(),
  details: AuditLogDetailsSchema,
  created_at: z.string(),
  updated_at: z.string(),
  full_name: z.string(),
  email: z.email(),
  role_name: z.string(),
})
export type AuditLog = z.infer<typeof AuditLogSchema>

// ── Audit Log List ──────────────────────────────────────────────────────────
export const AuditLogListSchema = z.array(AuditLogSchema)
export type AuditLogList = z.infer<typeof AuditLogListSchema>
