import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { categoryObj, scanPageParams } from '@interfaces/categories.types'
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
import { categoriesEnvs } from '@handlers/v1/categories/lib/envs'

const dynamoDbConfig = {
    region: categoriesEnvs.REGION,
    tableName: categoriesEnvs.CATEGORIES_TABLE,
    gsiName: categoriesEnvs.CATEGORIES_GSI_INDEX,
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
    if (event.httpMethod !== 'GET') {
        return errorResponse({
            statusCode: BAD_REQUEST,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Invalid request method',
            responseData: { message: 'Only GET method is allowed' },
        })
    }

    // * Get the limit and lastKey from params
    const limit = event.queryStringParameters?.limit
        ? parseInt(event.queryStringParameters.limit)
        : 10 // * Default limit

    const lastKeyParam = event.queryStringParameters?.lastKey || null
    const lastEvaluatedKey = lastKeyParam ? JSON.parse(lastKeyParam) : undefined

    try {
        // * Prepare the params to get the items from DynamoDB
        const params: scanPageParams = {
            limit,
            lastEvaluatedKey,
        }

        // * Scan items from DynamoDB
        const results = await dynamoDbClient.scanPage(params)

        // * Validate if the item was returned
        if (!results) {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'No categories found',
            })
        }

        // * Return success response
        const categories: categoryObj[] = results.items.map((item) => ({
            id: item.id.S!,
            name: item.name.S!,
            label: item.label.S!,
        }))
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Success',
            responseData: { categories },
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error getting the categories',
            responseData: { message: errorMsg },
        })
    }
}
