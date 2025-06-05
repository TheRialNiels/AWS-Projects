import { get } from 'env-var'

export const envs = {
    BASE_URL: get('BASE_URL').required().asString(),
    PRODUCTS_TABLE: get('PRODUCTS_TABLE').required().asString(),
    ENVIRONMENT: get('ENVIRONMENT').required().asString(),
    REGION: get('REGION').required().asString(),
}
