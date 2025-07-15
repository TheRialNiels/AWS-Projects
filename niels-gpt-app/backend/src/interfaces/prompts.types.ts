import z from 'zod/v4'

export const PromptSchema = z.object({
  threadId: z.uuid('Must be a valid UUID').optional(),
  createdAt: z.iso.datetime('Must be a valid ISO datetime'),
  role: z
    .string('Must be a string')
    .refine((role) => role === 'user' || role === 'assistant', {
      message: 'Must be either "user" or "assistant"',
    })
    .default('user'),
  responseId: z.string('Must be a string').optional(),
  content: z
    .string('Must be a string')
    .min(1, 'Must contain at least 1 character'),
})

export type Prompt = z.infer<typeof PromptSchema>
