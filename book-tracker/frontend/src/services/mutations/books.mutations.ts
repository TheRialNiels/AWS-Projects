import type { Book, GetBooksResponse } from '@/interfaces/books.types'
import {
  deleteBookApi,
  patchBookApi,
  postBookApi,
} from '@/services/api/books.api'
import { useErrorToast, useSuccessToast } from '@/lib/toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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

    // * Optimistically update UI
    onMutate: async (updatedBook) => {
      await queryClient.cancelQueries({ queryKey: ['getBooks'] })

      const previousBooks = queryClient.getQueryData<GetBooksResponse>([
        'getBooks',
      ])

      queryClient.setQueryData<GetBooksResponse>(['getBooks'], (old) => {
        return old
          ? {
              ...old,
              responseData: {
                ...old.responseData,
                books: old.responseData.books.map((book) =>
                  book.id === updatedBook.id
                    ? { ...book, ...updatedBook }
                    : book,
                ),
              },
            }
          : old
      })

      return { previousBooks }
    },

    // * If error, rollback
    onError: (error: any, _variables, context) => {
      const errorMessage = error?.response?.data.message || errorMsg
      if (context?.previousBooks) {
        queryClient.setQueryData(['getBooks'], context.previousBooks)
      }
      useErrorToast(errorMessage)
    },

    // * If success, keep optimistic update and notify
    onSuccess: (response) => {
      // * Validate response against optimistic data
      if (response && response.responseData.id) {
        setOpen(false)
        useSuccessToast(successMsg)
        return
      }
      // * If backend didn't confirm, rollback
      queryClient.invalidateQueries({ queryKey: ['getBooks'] })
      useErrorToast('Update not confirmed by server.')
    },

    // * Re-sync with server to ensure consistency (optional)
    // onSettled: async () => {
    //   await queryClient.invalidateQueries({ queryKey: ['getBooks'] })
    // },
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
