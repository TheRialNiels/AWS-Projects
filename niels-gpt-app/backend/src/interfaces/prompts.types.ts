import * as z from 'zod'

const PromptIdSchema = z.string().uuid('Must be a valid UUID').optional()
const PromptThreadIdSchema = z.string().uuid('Must be a valid UUID').optional()
const PromptCreatedAtSchema = z
  .string()
  .datetime('Must be a valid ISO datetime')
const PromptRoleSchema = z
  .string({ message: 'Must be a string' })
  .refine((role) => role === 'user' || role === 'assistant', {
    message: 'Must be either "user" or "assistant"',
  })
  .default('user')
const PromptResponseIdSchema = z
  .string({ message: 'Must be a string' })
  .optional()
const PromptContentSchema = z
  .string({ message: 'Must be a string' })
  .min(1, 'Must contain at least 1 character')

export const PromptSchema = z.object({
  id: PromptIdSchema,
  threadId: PromptThreadIdSchema,
  createdAt: PromptCreatedAtSchema,
  role: PromptRoleSchema,
  responseId: PromptResponseIdSchema,
  content: PromptContentSchema,
})

export const PromptPayloadSchema = z.object({
  prompt: PromptContentSchema,
  threadId: PromptThreadIdSchema,
})

export type Prompt = z.infer<typeof PromptSchema>
export type PromptPayload = z.infer<typeof PromptPayloadSchema>
