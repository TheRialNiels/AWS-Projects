import {
  deleteBookApi,
  patchBookApi,
  postBookApi,
} from '@/services/api/books.api'
import { useErrorToast, useSuccessToast } from '@/lib/toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Book } from '@/interfaces/books.types'

export const useCreateBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Book) => postBookApi(data),

    onSettled: async (_, error) => {
      if (error) return
      await queryClient.invalidateQueries({ queryKey: ['getBooks'] })
    },
  })
}

export const useUpdateBook = (
  setOpen: (open: boolean) => void,
  successMsg: string,
  errorMsg: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Book) => patchBookApi(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['getBooks'] })
      setOpen(false)
      useSuccessToast(successMsg)
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data.message || errorMsg
      useErrorToast(errorMessage)
    },
  })
}

export const useDeleteBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBookApi(id),

    onSettled: async (_, error) => {
      if (error) return
      await queryClient.invalidateQueries({ queryKey: ['getBooks'] })
    },
  })
}
