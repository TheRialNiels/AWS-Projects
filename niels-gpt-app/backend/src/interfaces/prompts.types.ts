import * as z from 'zod'

export const PromptSchema = z.object({
  threadId: z.string().uuid('Must be a valid UUID').optional(),
  createdAt: z.string().datetime('Must be a valid ISO datetime'),
  role: z
    .string({ message: 'Must be a string' })
    .refine((role) => role === 'user' || role === 'assistant', {
      message: 'Must be either "user" or "assistant"',
    })
    .default('user'),
  responseId: z.string({ message: 'Must be a string' }).optional(),
  prompt: z
    .string({ message: 'Must be a string' })
    .min(1, 'Must contain at least 1 character'),
})

export type Prompt = z.infer<typeof PromptSchema>
