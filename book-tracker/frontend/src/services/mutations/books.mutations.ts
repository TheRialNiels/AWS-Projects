import type { Book, GetBooksResponse } from '@/interfaces/books.types'
import {
  deleteBookApi,
  patchBookApi,
  postBookApi,
} from '@/services/api/books.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useOptimisticMutation } from '@/services/mutations/useOptimistic.mutations'

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
  return useOptimisticMutation<Book, Book>({
    queryKey: ['getBooks'],
    getId: (book) => book.id!,
    mutationFn: patchBookApi,
    getItems: (data: GetBooksResponse) => data.responseData.books,
    setItems: (newBooks, oldData: GetBooksResponse) => ({
      ...oldData,
      responseData: {
        ...oldData.responseData,
        books: newBooks,
      },
    }),
    successMsg,
    errorMsg,
    onDone: () => setOpen(false),
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
