import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
    const filename = pollyResponse.SynthesisTask?.OutputUri?.split('/').pop()

    // * Create S3 Signed Url
    const s3 = new S3Client({ region: 'us-east-1' })
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    })
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Audio file created successfully',
        downloadUrl: signedUrl,
      }),
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: err.message }),
    }
  }
}
