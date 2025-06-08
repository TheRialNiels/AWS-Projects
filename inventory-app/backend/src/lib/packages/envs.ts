import { get } from 'env-var'

export const envs = {
    BASE_URL: get('BASE_URL').required().asString(),
    ENVIRONMENT: get('ENVIRONMENT').required().asString(),
    REGION: get('REGION').required().asString(),
    CATEGORIES_TABLE: get('CATEGORIES_TABLE').required().asString(),
    CATEGORIES_GSI_INDEX: get('CATEGORIES_GSI_INDEX').required().asString(),
    PRODUCTS_TABLE: get('PRODUCTS_TABLE').required().asString(),
    PRODUCTS_GSI_INDEX: get('PRODUCTS_GSI_INDEX').required().asString(),
}
