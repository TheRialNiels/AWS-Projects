import { z } from 'zod/v4'

export type InferSchema<T extends z.ZodType> = z.infer<T>

type FieldMap = Record<string, () => z.ZodType>

export const createSchema = <T extends FieldMap>(
  fields: T,
): z.ZodObject<{
  [K in keyof T]: ReturnType<T[K]>
}> => {
  const shape = Object.fromEntries(
    Object.entries(fields).map(([key, fn]) => [key, fn()]),
  ) as {
    [K in keyof T]: ReturnType<T[K]>
  }
  return z.object(shape)
}

export const validateSchema = <T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.ZodSafeParseResult<z.infer<T>> => {
  return schema.safeParse(data)
}

export const returnFlattenError = (error: z.ZodError) => {
  return z.flattenError(error)
}

// * Helper for dynamic error message
const defaultError = (field: string, fallback: string, custom?: string) =>
  custom || `${field} ${fallback}`

// * ========== FIELD HELPERS ========== * //
type FieldOptions = {
  optional?: boolean
  nullable?: boolean
  minLength?: number
  maxLength?: number
  includesValue?: string
  regex?: RegExp
  message?: string
}

export const urlField = (field: string, options?: FieldOptions): z.ZodURL => {
  let schema = z.url(
    defaultError(field, 'must be a valid URL', options?.message),
  )
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const uuidField = (field: string, options?: FieldOptions): z.ZodUUID => {
  let schema = z.uuid(
    defaultError(field, 'must be a valid UUID', options?.message),
  )
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const emailField = (
  field: string,
  options?: FieldOptions,
): z.ZodEmail => {
  let schema = z.email(
    defaultError(field, 'must be a valid email', options?.message),
  )
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const stringField = (
  field: string,
  options?: FieldOptions,
): z.ZodString => {
  let schema = z
    .string(defaultError(field, 'must be a string', options?.message))
    .trim()
  if (options?.regex) {
    schema = schema.regex(
      options.regex,
      defaultError(field, 'must match the pattern', options?.message),
    )
  }
  if (options?.minLength) {
    schema = schema.min(
      options.minLength,
      defaultError(
        field,
        `must be at least ${options.minLength} characters`,
        options.message,
      ),
    )
  }
  if (options?.maxLength) {
    schema = schema.max(
      options.maxLength,
      defaultError(
        field,
        `must be at most ${options.maxLength} characters`,
        options.message,
      ),
    )
  }
  if (options?.includesValue) {
    schema = schema.includes(options.includesValue, {
      error: defaultError(
        field,
        `must include ${options.includesValue}`,
        options.message,
      ),
    })
  }
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const enumField = (
  field: string,
  values: [string, ...string[]],
  options?: FieldOptions,
): z.ZodEnum => {
  let schema = z.enum(values, {
    error: defaultError(
      field,
      `must be one of ${values.join(', ')}`,
      options?.message,
    ),
  })
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const numberField = (
  field: string,
  options?: FieldOptions,
): z.ZodNumber => {
  let schema = z.number(
    defaultError(field, 'must be a number', options?.message),
  )
  if (options?.minLength) {
    schema = schema.min(
      options.minLength,
      defaultError(
        field,
        `must be at least ${options.minLength}`,
        options.message,
      ),
    )
  }
  if (options?.maxLength) {
    schema = schema.max(
      options.maxLength,
      defaultError(
        field,
        `must be at most ${options.maxLength}`,
        options.message,
      ),
    )
  }
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const objectField = (
  shape: z.ZodAny,
  options?: FieldOptions,
): z.ZodObject => {
  let schema = z.object(shape, {
    error: options?.message || 'Must be an object',
  })
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const arrayField = (items: any, options?: FieldOptions): z.ZodArray => {
  let schema = z.array(items, {
    error: options?.message || 'Must be an array',
  })
  if (options?.minLength) {
    schema = schema.min(
      options.minLength,
      defaultError(
        '',
        `must be at least ${options.minLength} items`,
        options.message,
      ),
    )
  }
  if (options?.maxLength) {
    schema = schema.max(
      options.maxLength,
      defaultError(
        '',
        `must be at most ${options.maxLength} items`,
        options.message,
      ),
    )
  }
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const isoDateTimeField = (
  field: string,
  options?: FieldOptions,
): z.ZodISODateTime => {
  let schema = z.iso
    .datetime(
      defaultError(field, 'must be a valid ISO date-time', options?.message),
    )
    .refine((date) => !isNaN(Date.parse(date)), {
      message: defaultError(
        field,
        'must be a valid ISO date-time',
        options?.message,
      ),
    })
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}
