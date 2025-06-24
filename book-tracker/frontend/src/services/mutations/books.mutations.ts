import type { Book, GetBooksResponse } from '@/interfaces/books.types'
import {
  deleteBookApi,
  importBooksApi,
  patchBookApi,
  postBookApi,
} from '@/services/api/books.api'
import { useErrorToast, useSuccessToast } from '../../lib/toastify'
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
  onResetPagination: () => void,
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
    onDone: () => {
      onResetPagination?.()
      setOpen(false)
    },
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
  onResetPagination: () => void,
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
    onDone: () => {
      onResetPagination?.()
      setOpen(false)
    },
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

export const useDeleteBook = (
  setOpen: (open: boolean) => void,
  successMsg: string,
  errorMsg: string,
  onResetPagination: () => void,
) => {
  return useOptimisticMutation<Book, Book>({
    mutationKey: ['delete-book'],
    queryKey: ['getBooks'],
    getId: (book) => book.id!,
    mutationFn: deleteBookApi,
    getItems: (data: GetBooksResponse) => data.responseData.books,
    setItems: (newBooks, oldData: GetBooksResponse) => ({
      ...oldData,
      responseData: {
        ...oldData.responseData,
        books: newBooks,
      },
    }),
    updateItems: (prevBooks, deletedBook) =>
      prevBooks.filter((book) => book.id !== deletedBook.id),
    successMsg,
    errorMsg,
    onDone: () => {
      onResetPagination?.()
      setOpen(false)
    },
  })
}

export const useOptimisticDeletingBook = (bookId?: string) => {
  const mutations = useMutationState({
    filters: {
      mutationKey: ['delete-book'],
      status: 'pending',
    },
  })

  return mutations.some((m) => m.variables === bookId)
}

export const useImportBooks = (
  setOpen: (open: boolean) => void,
  successMsg: string,
  errorMsg: string,
  onResetPagination: () => void,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['import-books'],
    mutationFn: importBooksApi,
    onSuccess: (response) => {
      console.log('🚀 ~ response:', response)
      useSuccessToast(successMsg)
      setOpen(false)
      onResetPagination()
      queryClient.invalidateQueries({ queryKey: ['getBooks'] })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || errorMsg
      useErrorToast(message)
    },
  })
}
