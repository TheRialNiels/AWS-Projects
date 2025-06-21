import type {
  Book,
  CreateBookResponse,
  DeleteBookResponse,
  GetBooksResponse,
  PatchBookResponse,
} from '@/interfaces/books.types'

import { api } from '@/lib/axios'

const path = '/v1/books'

export const getBooksApi = async (): Promise<GetBooksResponse> => {
  const response = await api.get<GetBooksResponse>(path)
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
    data: Book
): Promise<DeleteBookResponse> => {
  const response = await api.delete(`${path}/${data.id}`, { data })
  return response.data
}
