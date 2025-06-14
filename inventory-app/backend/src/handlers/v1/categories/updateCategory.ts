import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { convertTextToCamelCase, isString } from '@lib/utils'
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
import type { queryParams, updateItemParams } from '@interfaces/shared.types'

import { CategoriesDynamoDBClient } from './lib/dynamoDbClient'
import { categorySchema } from '@interfaces/categories.types'
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
    const body = JSON.parse(event.body || '{}')
    body.id = event.pathParameters?.id

    // * Trim whitespace
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
        // * Convert the label to camelCase
        body.name = convertTextToCamelCase(body.label)

        // * Verify if the category already exists
        const query: queryParams = {
            keyConditionExpression: '#name = :name',
            expressionAttributeNames: { '#name': 'name' },
            expressionAttributeValues: { ':name': { S: body.name } },
        }
        const result = await dynamoDbClient.query(query)

        // * Return an error if the item already exists
        if (result && result.length > 0) {
            return errorResponse({
                statusCode: BAD_REQUEST,
                additionalHeaders: createCORSHeaders(origin, [], methods),
                message: 'Category already exists',
                responseData: {
                    message: `A category with name "${body.label}" already exists`,
                },
            })
        }

        // * Prepare the item to be inserted into DynamoDB
        const params: updateItemParams = {
            key: { id: { S: body.id } },
            updateExpression: 'SET #name = :name, #label = :label',
            expressionAttributeNames: {
                '#name': 'name',
                '#label': 'label',
            },
            expressionAttributeValues: {
                ':name': { S: body.name },
                ':label': { S: body.label },
            },
            conditionExpression: 'attribute_exists(id)',
        }

        // * Update item into DynamoDB
        await dynamoDbClient.updateItem(params)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Category updated successfully',
            responseData: body,
        })
    } catch (err: any) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: err.$metadata.httpStatusCode || INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error updating category',
            responseData: { message: errorMsg },
        })
    }
}
