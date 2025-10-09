export interface BodyOptions {
  statusCode: number
  message?: string | Record<string, any>
  responseData?: Record<string, any>
  success?: boolean
  additionalHeaders?: Record<string, string>
}

export interface ResponseBody {
  responseData: Record<string, any> | undefined
  success: boolean | undefined
  message?: string | Record<string, any> | undefined
  error?: string | Record<string, any> | undefined
  cause?: string | Record<string, any> | undefined
}
