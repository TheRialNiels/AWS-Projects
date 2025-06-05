import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    ConditionalCheckFailedException,
    DynamoDBClient,
    PutItemCommand,
} from '@aws-sdk/client-dynamodb'
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

import { categoriesEnvs } from '@handlers/v1/categories/lib/envs'
import { categorySchema } from '@interfaces/categories.types'
import { isString } from '@lib/utils'

const dynamoDbClient = new DynamoDBClient({ region: categoriesEnvs.REGION })

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

    // * Trim whitespace
    isString(body.name) ? (body.name = body.name.trim()) : null
    isString(body.label) ? (body.label = body.label.trim()) : null

    // * Validate payload with schema
    const schemaValidation = categorySchema.safeParse(body)
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
            name: { S: body.name },
            label: { S: body.label },
        }

        // * Insert the item into DynamoDB
        const command = new PutItemCommand({
            TableName: categoriesEnvs.CATEGORIES_TABLE,
            Item: item,
            ConditionExpression: 'attribute_not_exists(name)',
        })
        await dynamoDbClient.send(command)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Category created successfully',
            responseData: body,
        })
    } catch (err: ConditionalCheckFailedException | any) {
        // * Check if the error is due to the item already existing
        if (err.name === 'ValidationException') {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'Category already exists',
                responseData: {
                    message: `A category with name "${body.name}" already exists`,
                },
            })
        }

        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error creating category',
            responseData: { message: errorMsg },
        })
    }
}
