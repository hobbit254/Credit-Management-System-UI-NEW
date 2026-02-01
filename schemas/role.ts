import { z } from 'zod'

export interface Role {
  roles_uuid: string
  role_name: string
  role_slug: string
  description: string
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export const NewRoleSchema = z.object({
  role_name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be less than 50 characters'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(200, 'Description must be less than 200 characters'),
})
export type NewRole = z.infer<typeof NewRoleSchema>
