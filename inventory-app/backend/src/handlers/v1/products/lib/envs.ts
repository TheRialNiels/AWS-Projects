import { envs } from '@lib/packages/envs'
import { get } from 'env-var'

export const productsEnvs = {
    ...envs,
    CATEGORIES_TABLE: get('CATEGORIES_TABLE').required().asString(),
    CATEGORIES_GSI_INDEX: get('CATEGORIES_GSI_INDEX').required().asString(),
    PRODUCTS_TABLE: get('PRODUCTS_TABLE').required().asString(),
    PRODUCTS_GSI_INDEX: get('PRODUCTS_GSI_INDEX').required().asString(),
}
