import { APIGatewayProxyEvent } from 'aws-lambda'
import { env } from '@lib/packages/env'

export const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'X-Amz-Date',
  'Authorization',
  'X-Api-Key',
  'X-Amz-Security-Token',
]

export const DEFAULT_ALLOWED_METHODS = [
  'OPTIONS',
  'HEAD',
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
]

export const ALLOWED_ORIGINS =
  env.ENVIRONMENT === 'prod'
    ? [env.ALLOW_ORIGIN]
    : [env.ALLOW_ORIGIN, 'http://localhost:*']

export const ALLOW_CREDENTIALS = env.ALLOW_CREDENTIALS === 'true'

export const getOriginFromEvent = (
  event: APIGatewayProxyEvent,
): string | null => {
  if (!event.headers) return null
  return event.headers.Origin || event.headers.origin || null
}

export const compileURLWildcards = (url: string): RegExp => {
  const urlUnreservedPattern = '[A-Za-z0-9-._~]'
  const wildcardPattern = `${urlUnreservedPattern}*`

  const escapeRegex = (str: string) =>
    str.replace(/([.?+^$[\]\\(){}|-])/g, '\\$1')

  const parts = url.split('*').map(escapeRegex)
  return new RegExp(`^${parts.join(wildcardPattern)}$`)
}

export const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false

  if (ALLOWED_ORIGINS.includes('*')) {
    return true
  }

  const allowedPatterns = ALLOWED_ORIGINS.filter(
    (origin): origin is string => origin !== undefined,
  ).map(compileURLWildcards)

  return allowedPatterns.some((pattern) => pattern.test(origin))
}

export const createCORSHeaders = (
  origin: string | null,
  headers?: string[],
  methods?: string[],
): Record<string, string> => {
  const allowedHeaders =
    headers?.length ?? 0
      ? headers!.join(',')
      : DEFAULT_ALLOWED_HEADERS.join(',')

  const allowedMethods =
    methods?.length ?? 0
      ? methods!.join(',')
      : DEFAULT_ALLOWED_METHODS.join(',')

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Headers': allowedHeaders,
    'Access-Control-Allow-Methods': allowedMethods,
  }

  // * If "*" is explicitly allowed and credentials are off, return wildcards
  if (ALLOWED_ORIGINS.includes('*') && !ALLOW_CREDENTIALS) {
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    return corsHeaders
  }

  // * If origin is allowed, return exact origin
  if (origin && isOriginAllowed(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin

    // * Add credentials header only if enabled
    if (ALLOW_CREDENTIALS) {
      corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    }

    return corsHeaders
  }

  // * Fallback: return empty headers for disallowed origins
  return {}
}

export const createPreflightResponse = (
  origin: string | null,
  maxAge?: number,
) => {
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
