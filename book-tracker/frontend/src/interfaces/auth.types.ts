import {
  type InferSchema,
  createSchema,
  emailField,
  stringField,
} from '@/lib/zod'

export const LoginEmailSchema = emailField('Email')
export const LoginPasswordSchema = stringField('Password')

export const LoginSchema = createSchema({
  email: () => LoginEmailSchema,
  password: () => LoginPasswordSchema,
})

export type LoginEmail = InferSchema<typeof LoginEmailSchema>
export type LoginPassword = InferSchema<typeof LoginPasswordSchema>
export type Login = InferSchema<typeof LoginSchema>
