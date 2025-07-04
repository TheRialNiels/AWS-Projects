import { categorySchema, type categoryObj } from '@interfaces/categories.types'
import type { createItemParams, queryParams } from '@interfaces/shared.types'
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
import { convertTextToCamelCase, isString } from '@lib/utils'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { envs } from '@lib/packages/envs'
import { generateUuid } from '@lib/packages/uuid'
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
            responseData: {
                message: `Only ${methods.join(', ')} methods are allowed`,
            },
        })
    }

    // * Get the body payload from request
    const body: categoryObj = JSON.parse(event.body || '{}')
    body.id = body.id || generateUuid()

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
        const camelCaseLabel = convertTextToCamelCase(body.label)

        // * Verify if the category already exists
        const query: queryParams = {
            expressionAttributeValues: { ':name': { S: camelCaseLabel } },
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
        body.name = camelCaseLabel
        const params: createItemParams = {
            item: {
                id: { S: body.id },
                name: { S: body.name },
                label: { S: body.label },
            },
            conditionExpression: 'attribute_not_exists(id)',
        }

        // * Insert the item into DynamoDB
        await dynamoDbClient.createItem(params)

        // * Return success response
        return successResponse({
            statusCode: OK,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Category created successfully',
            responseData: body,
        })
    } catch (err) {
        const errorMsg = String(err) || 'Unexpected error'
        return errorResponse({
            statusCode: INTERNAL_SERVER_ERROR,
            additionalHeaders: createCORSHeaders(origin, [], methods),
            message: 'Error creating category',
            responseData: { message: errorMsg },
        })
    }
}
