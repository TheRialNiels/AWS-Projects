import { z } from 'zod'

export const categorySchema = z.object({
    label: z.string().min(3),
})
