import { z } from 'zod'

export const categorySchema = z.object({
    name: z.string().min(3),
    label: z.string().min(3),
})
