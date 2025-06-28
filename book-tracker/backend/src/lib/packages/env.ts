import { get } from 'env-var'

export const env = {
  ALLOW_ORIGIN: get('ALLOW_ORIGIN').required().asString(),
  ALLOW_CREDENTIALS: get('ALLOW_CREDENTIALS').required().asString(),
  REGION: get('REGION').required().asString(),
  ENVIRONMENT: get('ENVIRONMENT').required().asString(),
  BOOKS_TABLE: get('BOOKS_TABLE').required().asString(),
  BOOKS_USER_BOOK_KEY_GSI: get('BOOKS_USER_BOOK_KEY_GSI').required().asString(),
  BOOKS_FILES_UPLOADS_TABLE: get('BOOKS_FILES_UPLOADS_TABLE').required().asString(),
  BOOKS_UPLOAD_BUCKET: get('BOOKS_UPLOAD_BUCKET').required().asString(),
}
