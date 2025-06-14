import type { Category, GetCategoriesResponse } from '@interfaces/categories'

import { env } from '@lib/env'

const categoriesPath = `${env.VITE_BASE_URL}/v1/categories`

export const getCategoriesApi = async (): Promise<GetCategoriesResponse> => {
  try {
    const response = await fetch(categoriesPath)
    return response.json()
  } catch (error) {
    throw new Error(String(error))
  }
}

export const postCategoryApi = async (data: Category): Promise<any> => {
  try {
    const response = await fetch(categoriesPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  } catch (error) {
    throw new Error(String(error))
  }
}
