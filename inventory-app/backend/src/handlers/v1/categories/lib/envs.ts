import { envs } from '@lib/envs'
import { get } from 'env-var'

export const categoriesEnvs = {
    ...envs,
    CATEGORIES_TABLE: get('CATEGORIES_TABLE').required().asString(),
}
