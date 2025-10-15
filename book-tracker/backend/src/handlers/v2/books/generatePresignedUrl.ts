import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  GeneratePresignedUrlSchema,
  type GeneratePresignedUrlRequest,
  type UploadsFilesCreateItemParams,
} from '@interfaces/books-uploads.types'
import {
  createCORSHeaders,
  createPreflightResponse,
  getOriginFromEvent,
} from '@lib/cors'
import {
  errorResponse,
  httpStatusCodes,
  successResponse,
} from '@lib/httpResponse'
import { env } from '@lib/packages/env'
import { generateUuid } from '@lib/packages/uuid'
import { returnFlattenError, validateSchema } from '@lib/packages/zod'
import { UploadsFilesDynamoDBClient } from '@lib/uploadsFilesDynamoDBClient'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const s3Client = new S3Client({ region: env.REGION })
const dynamoDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_FILES_UPLOADS_TABLE,
}
const dynamoDBClient = new UploadsFilesDynamoDBClient(dynamoDbConfig)

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const origin = getOriginFromEvent(event)
  const methods = ['POST', 'OPTIONS']
  const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes

  try {
    if (event.httpMethod === 'OPTIONS') {
      return createPreflightResponse(origin)
    }

    if (methods.indexOf(event.httpMethod) === -1) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Invalid request method',
        responseData: {
          message: `Only ${methods.join(', ')} methods are allowed`,
        },
      })
    }

    const body: GeneratePresignedUrlRequest = JSON.parse(event.body || '{}')

    const schemaValidation = validateSchema(GeneratePresignedUrlSchema, body)
    if (schemaValidation.error) {
      const error = returnFlattenError(schemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Invalid request payload',
        responseData: { message: error },
      })
    }

    const updateId = generateUuid()
    const key = `uploads/${body.userId}/${updateId}.csv`

    const command = new PutObjectCommand({
      Bucket: env.BOOKS_UPLOAD_BUCKET,
      Key: key,
      ContentType: 'text/csv',
    })

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })

    const params: UploadsFilesCreateItemParams = {
      item: {
        updateId: { S: updateId },
        userId: { S: body.userId },
        stage: { S: 'processing' },
        totalRows: { N: '0' },
        processedRows: { N: '0' },
        successCount: { N: '0' },
        errorCount: { N: '0' },
        errors: { L: [] },
      },
    }

    await dynamoDBClient.createItem(params)

    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Presigned URL generated successfully',
      responseData: {
        updateId,
        presignedUrl,
        key,
      },
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error generating presigned URL',
      responseData: { message: 'Unexpected error' },
    })
  }
}
