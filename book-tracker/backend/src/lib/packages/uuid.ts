import { v4 as uuidv4 } from 'uuid'

/**
 * Generates a new universally unique identifier (UUID).
 *
 * @returns {string} A string representation of a UUID.
 */
export const generateUuid = (): string => {
    return uuidv4()
}
