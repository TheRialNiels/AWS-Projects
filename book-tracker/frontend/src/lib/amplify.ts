import { Amplify, type ResourcesConfig } from 'aws-amplify'
import { env } from '@/env'

const config = {
  Auth: {
    Cognito: {
      userPoolId: env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: env.VITE_COGNITO_APP_CLIENT_ID,
      region: env.VITE_AWS_REGION,
    },
  },
} as ResourcesConfig

Amplify.configure(config)
