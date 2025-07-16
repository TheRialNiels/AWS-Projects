import * as z from 'zod'

/**
 * Safely retrieves a value by executing a provided function. If the function throws an error
 * or returns a null/undefined value, a default value is returned instead.
 *
 * @template T - The type of the value to retrieve.
 * @param valueToGet - A function that returns the value to retrieve.
 * @param defaultsTo - The default value to return if the function throws an error or returns null/undefined.
 * @returns The retrieved value if successful and non-null, otherwise the default value.
 */
export const getValue = <T>(valueToGet: () => T, defaultsTo: T): T => {
  try {
    const value = valueToGet()
    return value != null ? value : defaultsTo
  } catch (error) {
    return defaultsTo
  }
}

/**
 * Checks if the given value is of type string.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is a string, otherwise `false`.
 */
export const isString = (value: any): boolean => {
  return typeof value === 'string'
}

/**
 * Checks if the provided value is of type `number`.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is a number, otherwise `false`.
 */
export const isNumber = (value: any): boolean => {
  return typeof value === 'number'
}

/**
 * Converts a given text string to camelCase format.
 *
 * This function transforms the input string to lowercase, removes spaces and numbers,
 * and capitalizes the first letter of each word (except the first word) to produce
 * a camelCase formatted string.
 *
 * @param text - The input string to be converted to camelCase.
 * @returns The camelCase formatted string.
 */
export const convertTextToCamelCase = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return '' // * Remove spaces and numbers
      return index === 0 ? match.toLowerCase() : match.toUpperCase()
    })
}

/**
 * Splits an array into smaller chunks of a specified size.
 *
 * @template T - The type of elements in the array.
 * @param arr - The array to be divided into chunks.
 * @param size - The maximum size of each chunk. Must be a positive integer.
 * @returns An array of chunks, where each chunk is an array containing up to `size` elements.
 *
 * @throws {Error} If `size` is not a positive integer.
 *
 * @example
 * ```typescript
 * const data = [1, 2, 3, 4, 5];
 * const chunks = chunkArray(data, 2);
 * console.log(chunks); // Output: [[1, 2], [3, 4], [5]]
 * ```
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Chunk size must be a positive integer')
  }

  if (arr.length === 0) {
    return []
  }

  const chunks: T[][] = []

  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size)
    chunks.push(chunk)
  }

  return chunks
}

/**
 * Validates the provided data against a given Zod schema.
 *
 * @template T - A Zod schema type extending `z.ZodType`.
 * @param schema - The Zod schema to validate the data against.
 * @param data - The data to be validated.
 * @returns A `ZodSafeParseResult` containing either the parsed data or validation errors.
 */
export const validateSchema = <T extends z.ZodType>(
  schema: T,
  data: unknown,
) => {
  return schema.safeParse(data)
}

/**
 * Flattens a Zod validation error into a more readable and structured format.
 *
 * @param error - The ZodError object containing validation errors.
 * @returns A flattened representation of the ZodError.
 */
export const returnFlattenError = (error: z.ZodError) => {
  return error.format()
}
