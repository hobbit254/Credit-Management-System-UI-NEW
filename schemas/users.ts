import { z } from 'zod'
import type { Role } from '~/schemas/role'

export interface User {
  user_uuid: string
  full_name: string
  email: string
  email_verified_at: string | null
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  roles: Role[]
}

export const NewUserSchema = z.object({
  full_name: z
    .string()
    .min(2)
    .max(100),
  email: z
    .email(),
  password: z
    .string()
    .min(8)
    .max(150),
  role_uuid: z
    .string(),
})
export type NewUser = z.infer<typeof NewUserSchema>
