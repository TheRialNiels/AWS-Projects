import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    createCORSHeaders,
    createPreflightResponse,
    getOriginFromEvent,
} from '@lib/cors'
import type { createItemParams, queryParams } from '@interfaces/shared.types'
import {
    errorResponse,
    httpStatusCodes,
    successResponse,
} from '@lib/httpResponse'
import { productObj, productSchema } from '@interfaces/products.types'

import { CategoriesDynamoDBClient } from '../categories/lib/dynamoDbClient'
import { ProductsDynamoDBClient } from './lib/dynamoDbClient'
import { isString } from '@lib/utils'
import { productsEnvs } from '@handlers/v1/products/lib/envs'

const dynamoDbConfig = {
    region: productsEnvs.REGION,
    tableName: productsEnvs.PRODUCTS_TABLE,
    gsiName: productsEnvs.PRODUCTS_GSI_INDEX,
}
const dynamoDbClient = new ProductsDynamoDBClient(dynamoDbConfig)
const catDynamoDbConfig = {
    region: productsEnvs.REGION,
    tableName: productsEnvs.CATEGORIES_TABLE,
    gsiName: productsEnvs.CATEGORIES_GSI_INDEX,
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
    const methods = ['POST', 'OPTIONS']
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
            responseData: { message: 'Only POST method is allowed' },
        })
    }

    // * Get the body payload from request
    const body: productObj = JSON.parse(event.body || '{}')
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

    try {
        // * Prepare the item to be inserted into DynamoDB
        const params: createItemParams = {
            item: {
                sku: { S: body.sku },
                name: { S: body.name },
                category: { S: body.category },
                quantity: { N: String(body.quantity) },
                price: { N: String(body.price) },
            },
            conditionExpression: 'attribute_not_exists(sku)',
        }

        // * Insert the item into DynamoDB
        await dynamoDbClient.createItem(params)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Product created successfully',
            responseData: body,
        })
    } catch (err: any) {
        if (err.name === 'ConditionalCheckFailedException') {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'Product with this SKU already exists',
                responseData: {},
            })
        }

        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error creating product',
            responseData: { message: errorMsg },
        })
    }
}
