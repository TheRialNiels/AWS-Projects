import * as cors from '../lib/cors-util'

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

import corsConfig from '../lib/cors-config.json'

const client = new DynamoDBClient({ region: 'us-east-1' })

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const handler = async (event, context) => {
    const origin = cors.getOriginFromEvent(event)
    const id = new Date().toString()
    const base = +event.base
    const exponent = +event.exponent
    const mathResult = Math.pow(base, exponent)

    const tableName = process.env.TABLE_NAME
    await client.send(
        new PutItemCommand({
            TableName: tableName,
            Item: {
                id: { N: id },
                result: { N: mathResult },
            },
        }),
    )

    return {
        headers: cors.createOriginHeader(origin, corsConfig.allowedOrigins),
        statusCode: 200,
        body: JSON.stringify(`Your result is: ${mathResult}`),
    }
}
