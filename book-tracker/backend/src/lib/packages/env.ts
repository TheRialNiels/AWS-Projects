import { get } from 'env-var'

export const env = {
  ALLOW_ORIGIN: get('ALLOW_ORIGIN').required().asString(),
  ALLOW_CREDENTIALS: get('ALLOW_CREDENTIALS').required().asString(),
  REGION: get('REGION').required().asString(),
  ENVIRONMENT: get('ENVIRONMENT').required().asString(),
  BOOKS_TABLE: get('BOOKS_TABLE').required().asString(),
  BOOKS_TITLE_GSI: get('BOOKS_TITLE_GSI').required().asString(),
}
