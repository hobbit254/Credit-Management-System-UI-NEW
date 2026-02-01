import { z } from 'zod'

export interface Permission {
  permission_uuid: string
  permission_name: string
  permission_slug: string
  description: string
  permission_action: string
  active: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export const NewPermissionSchema = z.object({
  permission_name: z
    .string()
    .min(2),
  description: z
    .string()
    .min(5),
  permission_action: z
    .string()
    .min(3),
})
export type NewPermission = z.infer<typeof NewPermissionSchema>
