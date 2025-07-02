import type {
  Book,
  CreateBookResponse,
  DeleteBookResponse,
  GetBooksResponse,
  ImportStatus,
  ImportStatusResponse,
  PatchBookResponse,
} from '@/interfaces/books.types'

import { api } from '@/lib/axios'

const path = '/v1/books'

export const getBooksApi = async (params: {
  userId: string
  limit?: number
  lastEvaluatedKey?: Record<string, any>
}): Promise<GetBooksResponse> => {
  const searchParams = new URLSearchParams()

  searchParams.append('userId', params.userId.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.lastEvaluatedKey)
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
  const response = await api.patch(`${path}/${data.bookId}`, data)
  return response.data
}

export const deleteBookApi = async (
  data: Book,
): Promise<DeleteBookResponse> => {
  const response = await api.delete(`${path}/${data.bookId}`, { data })
  return response.data
}

export const generatePresignedUrlApi = async (data: {
  userId: string
}): Promise<{
  updateId: string
  presignedUrl: string
  key: string
}> => {
  const response = await api.post(`${path}/generate-presigned-url`, data)
  return response.data.responseData
}

export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
): Promise<void> => {
  // * Using fetch for S3 presigned URL uploads (axios can cause issues)
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': 'text/csv',
    },
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }
}

export const getBooksStatusApi = async (
  updateId: string,
  userId: string,
): Promise<ImportStatus> => {
  const response = await api.get<ImportStatusResponse>(`${path}/status/${updateId}?userId=${userId}`)
  return response.data.responseData
}
