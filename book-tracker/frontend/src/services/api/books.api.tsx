import type {
  Book,
  CreateBookResponse,
  DeleteBookResponse,
  GetBooksResponse,
  PatchBookResponse,
} from '@/interfaces/books.types'

import { api } from '@/lib/axios'

const path = '/v1/books'

export const getBooksApi = async (params?: {
  limit?: number
  lastEvaluatedKey?: Record<string, any>
}): Promise<GetBooksResponse> => {
  const searchParams = new URLSearchParams()

  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.lastEvaluatedKey)
    searchParams.append(
      'lastEvaluatedKey',
      encodeURIComponent(JSON.stringify(params.lastEvaluatedKey)),
    )

  const response = await api.get<GetBooksResponse>(
    `${path}?${searchParams.toString()}`,
  )

  return response.data
}

export const postBookApi = async (data: Book): Promise<CreateBookResponse> => {
  const response = await api.post(path, data)
  return response.data
}

export const patchBookApi = async (data: Book): Promise<PatchBookResponse> => {
  const response = await api.patch(`${path}/${data.id}`, data)
  return response.data
}

export const deleteBookApi = async (
  data: Book,
): Promise<DeleteBookResponse> => {
  const response = await api.delete(`${path}/${data.id}`, { data })
  return response.data
}
