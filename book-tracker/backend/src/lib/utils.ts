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
