import type { GetCategoriesResponse } from '@interfaces/categories'
import { env } from '@lib/env'

const categoriesPath = 'v1/categories'

export const getCategoriesApi = async (): Promise<GetCategoriesResponse> => {
  const url = `${env.VITE_BASE_URL}/${categoriesPath}`
  try {
    const response = await fetch(url)
    return response.json()
  } catch (error) {
    throw new Error(String(error))
  }
}
