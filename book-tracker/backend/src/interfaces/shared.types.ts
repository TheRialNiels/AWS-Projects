export interface BodyOptions {
  statusCode: number
  message?: string | Record<string, any>
  responseData?: Record<string, any>
  success?: boolean
  additionalHeaders?: Record<string, string>
}
