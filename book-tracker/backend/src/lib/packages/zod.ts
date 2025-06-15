import { ZodObject, z } from 'zod/v4'

export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>

type FieldMap = Record<string, () => z.ZodTypeAny>

export function createSchema<T extends FieldMap>(fields: T): ZodObject<{
  [K in keyof T]: ReturnType<T[K]>
}> {
  const shape = Object.fromEntries(
    Object.entries(fields).map(([key, fn]) => [key, fn()])
  ) as {
    [K in keyof T]: ReturnType<T[K]>
  }

  return z.object(shape)
}
// export const createSchema = (fields: FieldMap) => {
//   const shape: Record<string, z.ZodTypeAny> = {}

//   for (const key in fields) {
//     shape[key] = fields[key]()
//   }

//   return z.object(shape)
// }

export const returnFlattenError = (
  error: z.ZodError,
) => {
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
  const schema = z.string(`${field} must be a string`).min(minLength, {
    error: (iss) => `Title must be at least ${iss.minimum} characters`,
  })

  maxLength && maxLength > 0
    ? schema.max(500, {
        error: (iss) => `Notes must be at most ${iss.maximum} characters`,
      })
    : null

  return schema
}

export const enumField = (field: string, enumValues: string[]) => {
  return z.enum(enumValues, {
    error: (iss) => `${field} must be one of: ${iss.options.join(', ')}`,
  })
}

export const numberField = (
  field: string,
  minValue: number,
  maxValue?: number,
) => {
  const schema = z.number(`${field} must be a number`).min(minValue, {
    error: (iss) => `${field} must be at least ${iss.minimum}`,
  })

  maxValue && maxValue > 0
    ? schema.max(maxValue, {
        error: (iss) => `${field} must be at most ${iss.maximum}`,
      })
    : null

  return schema
}
