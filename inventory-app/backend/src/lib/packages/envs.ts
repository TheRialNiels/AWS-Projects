import { get } from 'env-var'

export const envs = {
    BASE_URL: get('BASE_URL').required().asString(),
    ENVIRONMENT: get('ENVIRONMENT').required().asString(),
    REGION: get('REGION').required().asString(),
}
