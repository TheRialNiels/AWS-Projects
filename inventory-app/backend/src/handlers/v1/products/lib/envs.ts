import { envs } from '@lib/envs'
import { get } from 'env-var'

export const productsEnvs = {
    ...envs,
    PRODUCTS_TABLE: get('PRODUCTS_TABLE').required().asString(),
}
