import { type Item } from '@interfaces/books-uploads.types'
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
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UploadsFilesDynamoDBClient } from '@lib/uploadsFilesDynamoDBClient'
import { env } from '@lib/packages/env'

const dynamoDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_FILES_UPLOADS_TABLE,
}
const dynamoDBClient = new UploadsFilesDynamoDBClient(dynamoDbConfig)

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const origin = getOriginFromEvent(event)
  const methods = ['GET', 'OPTIONS']
  const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes

  try {
    // * Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return createPreflightResponse(origin)
    }

    // * Validate the HTTP method
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

    // * Get params from request
    const updateId = event.pathParameters?.updateId
    const userId = event.queryStringParameters?.userId

    if (!updateId || !userId) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Missing required parameters',
        responseData: { message: 'userId and updateId are required' },
      })
    }

    // * Get item from DynamoDB
    const { Item: item } = await dynamoDBClient.getItem(updateId, userId)

    // * Validate if the item was returned
    if (!item) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Import status not found',
      })
    }

    // * Parse errors from DynamoDB format
    const errors = item.errors?.L?.map((error: any) => 
      JSON.parse(error.S)
    ) || []

    // * Return success response
    const importStatus = {
      updateId: item.updateId.S!,
      userId: item.userId.S!,
      stage: item.stage.S!,
      totalRows: +item.totalRows.N!,
      processedRows: +item.processedRows.N!,
      successCount: +item.successCount.N!,
      errorCount: +item.errorCount.N!,
      errors,
    }

    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Success',
      responseData: importStatus,
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error retrieving import status',
      responseData: { message: 'Unexpected error' },
    })
  }
}