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
