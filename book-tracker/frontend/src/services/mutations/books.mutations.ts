import {
  deleteBookApi,
  patchBookApi,
  postBookApi,
} from '@/services/api/books.api'
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

export const useUpdateBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Book) => patchBookApi(data),

    onSettled: async (_, error) => {
      if (error) return
      await queryClient.invalidateQueries({ queryKey: ['getBooks'] })
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
