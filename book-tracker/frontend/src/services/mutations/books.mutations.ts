import type { Book, GetBooksResponse } from '@/interfaces/books.types'
import {
  deleteBookApi,
  patchBookApi,
  postBookApi,
} from '@/services/api/books.api'
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'

import { generateUuid } from '@/lib/uuid'
import { useOptimisticMutation } from '@/services/mutations/useOptimistic.mutations'

export const useCreateBook = (
  setOpen: (open: boolean) => void,
  successMsg: string,
  errorMsg: string,
) => {
  return useOptimisticMutation<Book, Book>({
    mutationKey: ['create-book'],
    queryKey: ['getBooks'],
    getId: (book) => book.id!,
    mutationFn: postBookApi,
    getItems: (data: GetBooksResponse) => data.responseData.books,
    setItems: (newBooks, oldData: GetBooksResponse) => ({
      ...oldData,
      responseData: {
        ...oldData.responseData,
        books: newBooks,
      },
    }),
    updateItems: (prevBooks, newBook) => {
      if (!newBook.id) newBook.id = generateUuid() // * Temp ID
      return [...prevBooks, newBook]
    },
    successMsg,
    errorMsg,
    onDone: () => setOpen(false),
  })
}

export const useOptimisticNewBook = () => {
  const optimisticMutations = useMutationState({
    filters: {
      mutationKey: ['create-book'],
      status: 'pending',
    },
  })

  const optimistic = optimisticMutations[0]?.variables as Book | undefined
  return optimistic
}

export const useUpdateBook = (
  setOpen: (open: boolean) => void,
  successMsg: string,
  errorMsg: string,
) => {
  return useOptimisticMutation<Book, Book>({
    mutationKey: ['edit-book'],
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

export const useOptimisticBook = (bookId?: string) => {
  const optimisticMutations = useMutationState({
    filters: {
      mutationKey: ['edit-book', bookId],
      status: 'pending',
    },
  })

  const optimistic = optimisticMutations[0]?.variables as Book | undefined
  return optimistic
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
