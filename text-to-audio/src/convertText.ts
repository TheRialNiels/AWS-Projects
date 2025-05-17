import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
  type StartSpeechSynthesisTaskCommandInput,
} from '@aws-sdk/client-polly'

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
  try {
    const body = JSON.parse(event.body || '{}')
    const text = body.text

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing "text" in request body' }),
      }
    }

    const BUCKET_NAME = process.env.BUCKET_NAME

    const pollyConfig = {
      region: 'us-east-1',
    }
    const pollyClient = new PollyClient(pollyConfig)
    const params = {
      OutputFormat: 'mp3',
      OutputS3BucketName: BUCKET_NAME,
      Text: body.text,
      VoiceId: 'Justin',
      LanguageCode: 'en-US',
    } as StartSpeechSynthesisTaskCommandInput
    const pollyCommand = new StartSpeechSynthesisTaskCommand(params)
    const pollyResponse = await pollyClient.send(pollyCommand)
    console.log('🚀 ~ handler ~ pollyResponse:', pollyResponse)
    const downloadUrl = pollyResponse.SynthesisTask?.OutputUri

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Audio file created successfully',
        downloadUrl,
      }),
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: err.message }),
    }
  }
}
