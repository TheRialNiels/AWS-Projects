import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
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

import { envs } from '@lib/envs'
import { productSchema } from '@interfaces/createProduct.types'

const dynamoDbClient = new DynamoDBClient({ region: envs.REGION })

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

    // * Get the body payload from request
    const body = JSON.parse(event.body || '{}')

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
        // * Prepare the item to be inserted into DynamoDB
        const item = {
            sku: { S: body.sku },
            name: { S: body.name },
            category: { S: body.category },
            quantity: { N: String(body.quantity) },
            price: { N: String(body.price) },
        }

        // * Insert the item into DynamoDB
        const command = new PutItemCommand({
            TableName: envs.PRODUCTS_TABLE,
            Item: item,
            ConditionExpression: 'attribute_not_exists(sku)',
        })
        await dynamoDbClient.send(command)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Product created successfully',
            responseData: { message: item },
        })
    } catch (err) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error creating product',
            responseData: { message: errorMsg },
        })
    }
}
