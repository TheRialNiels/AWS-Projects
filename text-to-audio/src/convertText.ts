import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

interface ErrorResponse {
  errorType: string
  errorMessage: string
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) throw Error('No text found in the request')
  const body = JSON.parse(event.body)
  console.log('🚀 ~ handler ~ body:', body)

  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'retrieve text',
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ err }),
    }
  }
}
