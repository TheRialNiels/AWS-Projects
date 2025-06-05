import { z } from 'zod'

export const productSchema = z.object({
    sku: z
        .string()
        .regex(
            /^[a-zA-Z]{2,3}-\d{6}$/,
            'SKU must be 2-3 letters followed by a dash and 6 digits',
        ),
    name: z.string(),
    category: z.string(),
    quantity: z.number().int().nonnegative(),
    price: z.number().nonnegative(),
})
