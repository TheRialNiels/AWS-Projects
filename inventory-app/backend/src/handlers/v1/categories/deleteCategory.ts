import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
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

import { CategoriesDynamoDBClient } from './lib/dynamoDbClient'
import { categoryIdSchema } from '@interfaces/categories.types'
import type { deleteItemParams } from '@interfaces/shared.types'
import { envs } from '@lib/packages/envs'

const dynamoDbConfig = {
    region: envs.REGION,
    tableName: envs.CATEGORIES_TABLE,
    gsiName: envs.CATEGORIES_GSI_INDEX,
}
const dynamoDbClient = new CategoriesDynamoDBClient(dynamoDbConfig)

/**
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const origin = getOriginFromEvent(event)
    const methods = ['DELETE', 'OPTIONS']
    const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes

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

    // * Get the id from request
    const id = event.pathParameters?.id

    // * Validate payload with schema
    const schemaValidation = categoryIdSchema.safeParse(id)
    if (!schemaValidation.success) {
        return errorResponse({
            statusCode: BAD_REQUEST,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Invalid request payload/parameters',
            responseData: { message: schemaValidation.error },
        })
    }

    try {
        // * Prepare the item to be deleted from DynamoDB
        const params: deleteItemParams = {
            key: { id: { S: id } },
            conditionExpression: 'attribute_exists(id)',
        }

        // * Delete item from DynamoDB
        await dynamoDbClient.deleteItem(params)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Category deleted successfully',
            responseData: { id },
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error deleting the category',
            responseData: { message: errorMsg },
        })
    }
}
