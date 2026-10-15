import { z } from 'zod'

const message = 'Enter a phone number, e.g. 0712 345 678'

// Written 0712 345 678 or +254 712 345 678; spaces are fine. The backend only requires one.
export const phoneNumber = z.string().trim()
  .regex(/^\+?[\d\s]+$/, message)
  .refine(value => value.replace(/\D/g, '').length >= 9 && value.replace(/\D/g, '').length <= 15, message)
