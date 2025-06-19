import type { Book, CreateBookResponse, GetBooksResponse } from '@/interfaces/books.types'

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

export const patchBookApi = async (data: Book): Promise<any> => {
  const response = await api.patch(`${path}/${data.id}`, data)
  return response.data
}

export const deleteBookApi = async (id: string): Promise<any> => {
  const response = await api.delete(`${path}/${id}`)
  return response.data
}

