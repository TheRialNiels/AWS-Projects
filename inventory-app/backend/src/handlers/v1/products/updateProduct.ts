import { productSchema, type productObj } from '@interfaces/products.types'
import type { queryParams, updateItemParams } from '@interfaces/shared.types'
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
import { isString } from '@lib/utils'
import { CategoriesDynamoDBClient } from '../categories/lib/dynamoDbClient'
import { ProductsDynamoDBClient } from './lib/dynamoDbClient'

const dynamoDbConfig = {
    region: envs.REGION,
    tableName: envs.PRODUCTS_TABLE,
    gsiName: envs.PRODUCTS_GSI_INDEX,
}
const dynamoDbClient = new ProductsDynamoDBClient(dynamoDbConfig)
const catDynamoDbConfig = {
    region: envs.REGION,
    tableName: envs.CATEGORIES_TABLE,
    gsiName: envs.CATEGORIES_GSI_INDEX,
}
const categoryDynamoDbClient = new CategoriesDynamoDBClient(catDynamoDbConfig)

/**
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const origin = getOriginFromEvent(event)
    const methods = ['PATCH', 'OPTIONS']
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
    const body: productObj = JSON.parse(event.body || '{}')
    body.sku = event.pathParameters?.id || ''

    // * Trim whitespace
    isString(body.sku) ? (body.sku = body.sku.trim()) : null
    isString(body.name) ? (body.name = body.name.trim()) : null
    isString(body.category) ? (body.category = body.category.trim()) : null

    // * Validate payload with schema
    const schemaValidation = productSchema.safeParse(body)
    if (!schemaValidation.success) {
        return errorResponse({
            statusCode: BAD_REQUEST,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Invalid request payload',
            responseData: { message: schemaValidation.error },
        })
    }

    try {
        // * Validate if the category exists in Categories table
        const query: queryParams = {
            expressionAttributeValues: { ':name': { S: body.category } },
        }
        const result = await categoryDynamoDbClient.query(query)

        // * Return an error if the item does not exist
        if (!result || result.length === 0) {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'Category not found',
                responseData: {
                    message: `Category "${body.category}" does not exist`,
                },
            })
        }

        // * Prepare the item to be updated into DynamoDB
        const params: updateItemParams = {
            key: { sku: { S: body.sku } },
            expressionAttributeValues: {
                ':name': { S: body.name },
                ':category': { S: body.category },
                ':quantity': { N: String(body.quantity) },
                ':price': { N: String(body.price) },
            },
        }

        // * Update item into DynamoDB
        await dynamoDbClient.updateItem(params)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Product updated successfully',
            responseData: body,
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error updating product',
            responseData: { message: errorMsg },
        })
    }
}
