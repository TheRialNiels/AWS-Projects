import {
    categoryIdSchema,
    type categoryObj,
} from '@interfaces/categories.types'
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
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { envs } from '@lib/packages/envs'
import { CategoriesDynamoDBClient } from './lib/dynamoDbClient'

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
    const methods = ['GET', 'OPTIONS']
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

    // * Get the body payload and id from request
    const id = event.pathParameters?.id

    // * Validate payload with schema
    const schemaValidation = categoryIdSchema.safeParse(id)
    if (!schemaValidation.success) {
        return errorResponse({
            statusCode: BAD_REQUEST,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Invalid request',
            responseData: { message: schemaValidation.error },
        })
    }

    try {
        // * Prepare the key for the DynamoDB item
        const key = {
            id: { S: id },
        }

        // * Get item from DynamoDB
        const results = await dynamoDbClient.getItem(key)

        // * Validate if the item was returned
        if (!results) {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'Category not found',
                responseData: { id },
            })
        }

        // * Return success response
        const category: categoryObj = {
            id: results.id.S!,
            name: results.name.S!,
            label: results.label.S!,
        }
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Success',
            responseData: { category },
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error getting the category',
            responseData: { message: errorMsg },
        })
    }
}
