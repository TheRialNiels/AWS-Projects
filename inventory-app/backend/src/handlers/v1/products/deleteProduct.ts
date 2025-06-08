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

import { ProductsDynamoDBClient } from './lib/dynamoDbClient'
import type { deleteItemParams } from '@interfaces/shared.types'
import { envs } from '@lib/packages/envs'
import { productSkuSchema } from '@interfaces/products.types'

const dynamoDbConfig = {
    region: envs.REGION,
    tableName: envs.PRODUCTS_TABLE,
    gsiName: envs.PRODUCTS_GSI_INDEX,
}
const dynamoDbClient = new ProductsDynamoDBClient(dynamoDbConfig)

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

    // * Get the sku from request
    const sku = event.pathParameters?.id

    // * Validate payload with schema
    const schemaValidation = productSkuSchema.safeParse(sku)
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
            key: { sku: { S: sku } },
            conditionExpression: 'attribute_exists(sku)',
        }

        // * Delete item from DynamoDB
        await dynamoDbClient.deleteItem(params)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Product deleted successfully',
            responseData: { id: sku },
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error deleting the product',
            responseData: { message: errorMsg },
        })
    }
}
