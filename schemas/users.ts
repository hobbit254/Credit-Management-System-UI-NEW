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
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),

  email: z
    .email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(150, 'Password must be at most 150 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Z0-9]/i, 'Password must contain at least one special character'),

  role_uuid: z
    .string()
    .min(1, 'Role is required'),

  password_confirmation: z
    .string()
    .min(8, 'Password confirmation must be at least 8 characters')
    .max(150, 'Password confirmation must be at most 150 characters'),
}).refine(data => data.password === data.password_confirmation, {
  path: ['password_confirmation'],
  message: 'Passwords must match',
})

export type NewUser = z.infer<typeof NewUserSchema>
