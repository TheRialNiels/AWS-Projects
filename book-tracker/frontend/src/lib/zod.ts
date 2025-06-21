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

export const validateSchema = <T extends z.ZodAny>(
  schema: T,
  data: unknown,
): z.ZodSafeParseResult<z.infer<T>> => {
  return schema.safeParse(data)
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
  message?: string
}

export const urlField = <T extends z.ZodURL = z.ZodURL>(
  field: string,
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z.url(
    defaultError(field, 'must be a valid URL', options?.message),
  ) as T
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const uuidField = <T extends z.ZodUUID = z.ZodUUID>(
  field: string,
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z.uuid(
    defaultError(field, 'must be a valid UUID', options?.message),
  ) as T
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const stringField = <T extends z.ZodString = z.ZodString>(
  field: string,
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z
    .string(defaultError(field, 'must be a string', options?.message))
    .trim() as T
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

export const enumField = <T extends z.ZodEnum = z.ZodEnum>(
  field: string,
  values: [string, ...string[]],
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z.enum(values, {
    error: defaultError(
      field,
      `must be one of ${values.join(', ')}`,
      options?.message,
    ),
  }) as T
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const numberField = <T extends z.ZodNumber = z.ZodNumber>(
  field: string,
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z.number(
    defaultError(field, 'must be a number', options?.message),
  ) as T
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

export const objectField = <T extends z.ZodObject = z.ZodObject>(
  shape: T,
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z.object(shape, {
    error: options?.message || 'Must be an object',
  }) as T
  if (options?.nullable) schema = schema.nullable() as any
  if (options?.optional) schema = schema.optional() as any
  return schema
}

export const arrayField = <T extends z.ZodArray = z.ZodArray>(
  items: T,
  options?: FieldOptions,
):
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodNullable<z.ZodOptional<T>> => {
  let schema = z.array(items, {
    error: options?.message || 'Must be an array',
  }) as unknown as T
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
