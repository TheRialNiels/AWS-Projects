import type {
  Book,
  CreateBookResponse,
  DeleteBookResponse,
  GetBooksResponse,
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
  file: File
): Promise<void> => {
  await api.put(presignedUrl, file, {
    headers: {
      'Content-Type': 'text/csv',
    },
  })
}

export const getImportStatusApi = async (
  updateId: string
): Promise<{
  updateId: string
  stage: string
  totalRows: number
  processedRows: number
  successCount: number
  errorCount: number
  errors: any[]
}> => {
  // TODO: Implement when backend endpoint is ready
  // const response = await api.get(`${path}/import/status/${updateId}`)
  // return response.data.responseData

  // Mock response for now
  return {
    updateId,
    stage: 'processing',
    totalRows: 0,
    processedRows: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
  }
}

// TODO: Add trigger import endpoint when backend is ready
// export const triggerImportApi = async (updateId: string): Promise<void> => {
//   const response = await api.post(`${path}/import/trigger`, { updateId })
//   return response.data
// }
