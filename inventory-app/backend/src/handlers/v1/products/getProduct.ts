import { productSkuSchema, type productObj } from '@interfaces/products.types'
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
import { ProductsDynamoDBClient } from './lib/dynamoDbClient'

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
    const sku = event.pathParameters?.id

    // * Validate payload with schema
    const schemaValidation = productSkuSchema.safeParse(sku)
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
            sku: { S: sku },
        }

        // * Get item from DynamoDB
        const results = await dynamoDbClient.getItem(key)

        // * Validate if the item was returned
        if (!results) {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'Product not found',
                responseData: { sku },
            })
        }

        // * Return success response
        const product: productObj = {
            sku: results.sku.S!,
            name: results.name.S!,
            category: results.category.S!,
            quantity: +results.quantity.N!,
            price: +results.price.S!,
        }
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Success',
            responseData: { product },
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error getting the product',
            responseData: { message: errorMsg },
        })
    }
}
