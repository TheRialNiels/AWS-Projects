import { ZodObject, z } from 'zod/v4'

export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>

type FieldMap = Record<string, () => z.ZodTypeAny>

export function createSchema<T extends FieldMap>(
  fields: T,
): ZodObject<{
  [K in keyof T]: ReturnType<T[K]>
}> {
  const shape = Object.fromEntries(
    Object.entries(fields).map(([key, fn]) => [key, fn()]),
  ) as {
    [K in keyof T]: ReturnType<T[K]>
  }

  return z.object(shape)
}

export const returnFlattenError = (error: z.ZodError) => {
  return z.flattenError(error)
}

export const uuidField = (field: string) => {
  return z.uuid(`${field} must be a valid UUID`)
}

export const stringField = (
  field: string,
  minLength: number,
  maxLength?: number,
) => {
  const schema = z
    .string(`${field} must be a string`)
    .min(minLength, `Title must be at least ${minLength} characters`)

  maxLength && maxLength > 0
    ? schema.max(500, `Notes must be at most ${maxLength} characters`)
    : null

  return schema
}

export const enumField = (field: string, enumValues: string[]) => {
  return z.enum(enumValues, `${field} must be one of: ${enumValues.join(', ')}`)
}

export const numberField = (
  field: string,
  minValue: number,
  maxValue?: number,
) => {
  const schema = z
    .number(`${field} must be a number`)
    .min(minValue, `${field} must be at least ${minValue}`)

  maxValue && maxValue > 0
    ? schema.max(maxValue, `${field} must be at most ${maxValue}`)
    : null

  return schema
}

export const DynamoAttributeValueSchema = z
  .object({
    S: z.string('Must be a string!').optional(),
    N: z.string('Must be a number!').optional(),
    BOOL: z.boolean('Must be a boolean!').optional(),
    NULL: z.literal(true).optional(),
  })
  .strict()

export const queryParamRecordField = () => {
  return z.preprocess(
    (val) =>
      typeof val === 'string' ? JSON.parse(decodeURIComponent(val)) : val,
    z.record(z.string(), DynamoAttributeValueSchema),
  )
}

export const preprocessNumber = () => {
  return z.preprocess(
    (value) => (typeof value === 'string' ? parseFloat(value) : value),
    z.number('Must be a number!'),
  )
}
