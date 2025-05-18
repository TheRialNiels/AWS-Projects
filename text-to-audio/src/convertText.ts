import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
  type StartSpeechSynthesisTaskCommandInput,
} from '@aws-sdk/client-polly'

// * Declare env variables
const BUCKET_NAME = process.env.BUCKET_NAME
const REGION = process.env.REGION

// * Create new Polly Client
const pollyClient = new PollyClient({ region: REGION })

// * Create S3 Client
const s3Client = new S3Client({ region: REGION })

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
    // * Extract text from request
    const body = JSON.parse(event.body || '{}')
    const text = body.text

    // * Validate the text
    const maxLength = 10000
    if (typeof text !== 'string' || text.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing "text" in request body' }),
      }
    } else if (text.length > maxLength) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Text length has exceeded the max length allowed (${maxLength} characters)`,
        }),
      }
    }

    // * Specify the values to generate the audio from text
    const key = `audio-${uuidv4()}`
    const params = {
      OutputFormat: 'mp3',
      OutputS3BucketName: BUCKET_NAME,
      Text: body.text,
      VoiceId: 'Justin',
      LanguageCode: 'en-US',
      OutputS3KeyPrefix: key
    } as StartSpeechSynthesisTaskCommandInput
    const pollyCommand = new StartSpeechSynthesisTaskCommand(params)
    const pollyResponse = await pollyClient.send(pollyCommand)

    // * Extract s3 Uri from polly response
    const s3Uri = pollyResponse.SynthesisTask?.OutputUri

    // * Validate audio file created successfully
    if (!s3Uri) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to create audio file', error: 'Unexpected error' }),
      }
    }

    // * Extract object key from s3 uri
    const objectKey = s3Uri.split('/').pop()

    // * Generate a signed url
    const getSignedUrlCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    })
    const signedUrl = await getSignedUrl(s3Client, getSignedUrlCommand, { expiresIn: 3600 })

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
