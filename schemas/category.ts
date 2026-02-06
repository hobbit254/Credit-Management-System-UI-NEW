import { z } from 'zod'

export interface Category {
  category_uuid: string
  category_name: string
  active: number
  deleted_at: string
  created_at: string
  updated_at: string
}

export const NewCategorySchema = z.object({
  category_name: z.string()
    .min(2),
})
export type NewCategory = z.infer<typeof NewCategorySchema>
