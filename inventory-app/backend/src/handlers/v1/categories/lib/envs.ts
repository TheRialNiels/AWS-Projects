import { envs } from '@lib/packages/envs'
import { get } from 'env-var'

export const categoriesEnvs = {
    ...envs,
    CATEGORIES_TABLE: get('CATEGORIES_TABLE').required().asString(),
    CATEGORIES_GSI_INDEX: get('CATEGORIES_GSI_INDEX').required().asString(),
}
