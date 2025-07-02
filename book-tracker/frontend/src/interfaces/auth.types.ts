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

export const RegisterEmailSchema = emailField('Email')
export const RegisterPasswordSchema = stringField('Password', {
  minLength: 8,
})
export const RegisterConfirmPasswordSchema = stringField('Confirm Password')

export const RegisterSchema = createSchema({
  email: () => RegisterEmailSchema,
  password: () => RegisterPasswordSchema,
  confirmPassword: () => RegisterConfirmPasswordSchema,
})

export type RegisterEmail = InferSchema<typeof RegisterEmailSchema>
export type RegisterPassword = InferSchema<typeof RegisterPasswordSchema>
export type RegisterConfirmPassword = InferSchema<
  typeof RegisterConfirmPasswordSchema
>
export type Register = InferSchema<typeof RegisterSchema>

export const ConfirmRegisterEmailSchema = emailField('Email')
export const ConfirmRegisterCodeSchema = stringField('Confirmation Code', {
  minLength: 6,
  maxLength: 6,
})

export const ConfirmRegisterSchema = createSchema({
  email: () => ConfirmRegisterEmailSchema,
  confirmationCode: () => ConfirmRegisterCodeSchema,
})

export type ConfirmRegisterEmail = InferSchema<
  typeof ConfirmRegisterEmailSchema
>
export type ConfirmRegisterCode = InferSchema<typeof ConfirmRegisterCodeSchema>
export type ConfirmRegister = InferSchema<typeof ConfirmRegisterSchema>
