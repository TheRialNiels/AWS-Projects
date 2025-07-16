import { get } from 'env-var'

export const env = {
  ALLOWED_ORIGIN: get('ALLOWED_ORIGIN').required().asString(),
  REGION: get('REGION').required().asString(),
}

export const promptsEnvs = {
  ...env,
  PROMPTS_TABLE: get('PROMPTS_TABLE').required().asString(),
  THREADS_TABLE: get('THREADS_TABLE').required().asString(),
  OPENAI_API_KEY_SECRET_NAME: get('OPENAI_API_KEY_SECRET_NAME').required().asString(),
}
