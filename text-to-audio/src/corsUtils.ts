import { APIGatewayProxyEvent } from 'aws-lambda'

/**
 * Default headers allowed by AWS API Gateway
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html
 */
export const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'X-Amz-Date',
  'Authorization',
  'X-Api-Key',
  'X-Amz-Security-Token',
]

/**
 * A constant array defining the default HTTP methods allowed for CORS (Cross-Origin Resource Sharing).
 * These methods include:
 * - `OPTIONS`: Used for preflight requests in CORS.
 * - `POST`: Used to send data to the server.
 */
export const DEFAULT_ALLOWED_METHODS = ['OPTIONS', 'POST']

/**
 * A list of allowed origins for Cross-Origin Resource Sharing (CORS).
 * This array defines the origins that are permitted to access resources on the server. It includes specific domains, wildcard subdomains, and localhost with any port for development purposes.
 * - `https://yourdomain.com`: Allows requests from the main domain.
 * - `https://*.yourdomain.com`: Allows requests from any subdomain of `yourdomain.com`.
 * - `http://localhost:*`: Permits requests from localhost on any port, typically used during development.
 */
export const ALLOWED_ORIGINS = ['https://yourdomain.com', 'https://*.yourdomain.com', 'http://localhost:*']

/**
 * Extracts the origin from the Lambda event headers
 * @param event - AWS API Gateway proxy event
 * @returns the Origin string, or null if not present
 */
export const getOriginFromEvent = (event: APIGatewayProxyEvent): string | null => {
  if (!event.headers) return null
  return event.headers.Origin || event.headers.origin || null
}

/**
 * Compiles a wildcard-enabled URL pattern to RegExp
 * Example: 'https://*.example.com' -> /^https:\/\/[A-Za-z0-9-._~]*\.example\.com$/
 * @param url - URL with optional wildcard(s)
 * @returns RegExp pattern to match origin
 */
export const compileURLWildcards = (url: string): RegExp => {
  const urlUnreservedPattern = '[A-Za-z0-9-._~]'
  const wildcardPattern = `${urlUnreservedPattern}*`

  const escapeRegex = (str: string) => str.replace(/([.?+^$[\]\\(){}|-])/g, '\\$1')

  const parts = url.split('*').map(escapeRegex)
  return new RegExp(`^${parts.join(wildcardPattern)}$`)
}

/**
 * Checks if the provided origin is allowed based on a list of allowed patterns.
 *
 * @param origin - The origin URL to validate. Can be a string or null.
 * @returns A boolean indicating whether the origin is allowed.
 */
export const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false
  const allowedPatterns = ALLOWED_ORIGINS.map(compileURLWildcards)
  return allowedPatterns.some((pattern) => origin.match(pattern))
}

/**
 * Creates CORS headers for a given origin if the origin is allowed.
 *
 * @param origin - The origin of the request. Can be a string or null.
 * @returns A record containing the CORS headers. Returns an empty object if the origin is not allowed or is null.
 *
 * @remarks
 * - The function checks if the provided origin is allowed using the `isOriginAllowed` function.
 * - If the origin is allowed, it generates headers for `Access-Control-Allow-Origin`,
 *   `Access-Control-Allow-Headers`, and `Access-Control-Allow-Methods`.
 * - Optionally, you can enable cookies by uncommenting the `Access-Control-Allow-Credentials` header.
 */
export const createCORSHeaders = (origin: string | null): Record<string, string> => {
  if (!origin || !isOriginAllowed(origin)) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS.join(','),
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS.join(','),
    // 'Access-Control-Allow-Credentials': 'true', // Optional: enable cookies if needed
  }
}

/**
 * Creates a preflight response for handling CORS (Cross-Origin Resource Sharing) requests.
 * This function generates the appropriate HTTP response headers for a CORS preflight request,including the `Access-Control-Max-Age` header if a `maxAge` value is provided.
 *
 * @param origin - The origin of the request, or `null` if no origin is specified.
 * @param maxAge - Optional. The maximum time, in seconds, that the preflight response can be cached.
 *                 If provided, it will be included in the `Access-Control-Max-Age` header.
 * @returns An object representing the HTTP response, with a status code of 204, the generated headers, and an empty body.
 */
export const createPreflightResponse = (origin: string | null, maxAge?: number) => {
  const headers = createCORSHeaders(origin)

  if (maxAge !== undefined) {
    headers['Access-Control-Max-Age'] = maxAge.toString()
  }

  return {
    statusCode: 204,
    headers,
    body: '',
  }
}
