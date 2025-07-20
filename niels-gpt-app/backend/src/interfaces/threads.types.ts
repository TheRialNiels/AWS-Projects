import * as z from 'zod'

const ThreadsUserIdSchema = z.string().uuid('Must be a valid UUID')
const ThreadsThreadIdSchema = z.string().uuid('Must be a valid UUID')
const ThreadsTitleSchema = z
  .string({ message: 'Must be a string' })
  .min(1, 'Must contain at least 1 character')
const ThreadsCreatedAtSchema = z
  .string()
  .datetime('Must be a valid ISO datetime')

export const ThreadSchema = z.object({
  userId: ThreadsUserIdSchema,
  threadId: ThreadsThreadIdSchema,
  title: ThreadsTitleSchema,
  createdAt: ThreadsCreatedAtSchema,
})

export type Thread = z.infer<typeof ThreadSchema>
