import type { APIGatewayProxyResult } from 'aws-lambda'
import type { BodyOptions } from '@interfaces/shared.types'
import { getValue } from './utils'

/**
 * A collection of standard HTTP status codes and their corresponding numeric values.
 * These codes are used to indicate the result of an HTTP request.
 *
 * @property {number} OK - The request has succeeded. (200)
 * @property {number} CREATED - The request has been fulfilled and resulted in a new resource being created. (201)
 * @property {number} NO_CONTENT - The server successfully processed the request, but is not returning any content. (204)
 * @property {number} BAD_REQUEST - The server could not understand the request due to invalid syntax. (400)
 * @property {number} UNAUTHORIZED - The client must authenticate itself to get the requested response. (401)
 * @property {number} FORBIDDEN - The client does not have access rights to the content. (403)
 * @property {number} NOT_FOUND - The server can not find the requested resource. (404)
 * @property {number} TOO_MANY_REQUESTS - The user has sent too many requests in a given amount of time. (429)
 * @property {number} INTERNAL_SERVER_ERROR - The server has encountered a situation it doesn't know how to handle. (500)
 * @property {number} NOT_IMPLEMENTED - The request method is not supported by the server and cannot be handled. (501)
 * @property {number} SERVICE_UNAVAILABLE - The server is not ready to handle the request. (503)
 * @property {number} GATEWAY_TIMEOUT - The server is acting as a gateway and cannot get a response in time. (504)
 */
export const httpStatusCodes = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
}

/**
 * Generates a set of JSON headers for HTTP responses, including a default
 * `Content-Type` header and optionally additional headers.
 *
 * @param additionalHeaders - Optional additional headers to include in the response.
 *                            These headers are merged with the default JSON headers.
 * @returns A record containing the headers for a JSON response.
 */
const getJsonHeaders = (
    additionalHeaders?: BodyOptions['additionalHeaders'],
): Record<string, string> => {
    return {
        'Content-Type': 'application/json',
        ...getValue(() => additionalHeaders, {}),
    }
}

/**
 * Generates a standardized error response for AWS API Gateway.
 *
 * @param options - Configuration options for the error response.
 * @param options.message - A custom error message to include in the response. Defaults to 'Unexpected error'.
 * @param options.responseData - Additional data to include in the response body. Defaults to an empty object.
 * @param options.success - Indicates the success status of the response. Defaults to `false`.
 * @param options.statusCode - The HTTP status code for the response. Defaults to `500`.
 * @param options.additionalHeaders - Additional headers to include in the response. Defaults to standard JSON headers.
 *
 * @returns An object conforming to the `APIGatewayProxyResult` interface, containing the error response body, headers, and status code.
 */
export const errorResponse = (options: BodyOptions): APIGatewayProxyResult => {
    return {
        statusCode: getValue(() => options.statusCode, 500),
        headers: getJsonHeaders(options.additionalHeaders),
        body: JSON.stringify({
            message: getValue(() => options.message, 'Unexpected error'),
            responseData: getValue(() => options.responseData, {}),
            success: getValue(() => options.success, false),
        }),
    }
}

/**
 * Generates a standardized success response for AWS API Gateway.
 *
 * @param options - An object containing the response options.
 * @param options.message - A custom message for the response. Defaults to 'Success'.
 * @param options.responseData - The data to include in the response body. Defaults to an empty object.
 * @param options.success - Indicates whether the response is successful. Defaults to `true`.
 * @param options.additionalHeaders - Additional headers to include in the response. Defaults to standard JSON headers.
 * @param options.statusCode - The HTTP status code for the response. Defaults to `200`.
 *
 * @returns An object conforming to the `APIGatewayProxyResult` interface, containing the response body, headers, and status code.
 */
export const successResponse = (
    options: BodyOptions,
): APIGatewayProxyResult => {
    return {
        statusCode: getValue(() => options.statusCode, 200),
        headers: getJsonHeaders(options.additionalHeaders),
        body: JSON.stringify({
            message: getValue(() => options.message, 'Success'),
            responseData: getValue(() => options.responseData, {}),
            success: getValue(() => options.success, true),
        }),
    }
}
