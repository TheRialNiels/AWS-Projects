import type { Book, GetBooksResponse } from '@/interfaces/books.types'
import {
  deleteBookApi,
  generatePresignedUrlApi,
  patchBookApi,
  postBookApi,
  uploadFileToS3,
} from '@/services/api/books.api'
import { useErrorToast, useSuccessToast } from '@/lib/toastify'
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
    getId: (book) => book.bookId!,
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
    getId: (book) => book.bookId!,
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
    getId: (book) => book.bookId!,
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

export const useGeneratePresignedUrl = () => {
  return useMutation({
    mutationKey: ['generate-presigned-url'],
    mutationFn: generatePresignedUrlApi,
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error generating upload URL'
      useErrorToast(message)
    },
  })
}

export const useUploadFile = () => {
  return useMutation({
    mutationKey: ['upload-file'],
    mutationFn: ({
      presignedUrl,
      file,
    }: {
      presignedUrl: string
      file: File
    }) => uploadFileToS3(presignedUrl, file),
    onError: () => {
      useErrorToast('Error uploading file')
    },
  })
}

export const useCompleteImportWorkflow = () => {
  return useMutation({
    mutationKey: ['complete-import-workflow'],
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const { updateId, presignedUrl } = await generatePresignedUrlApi({
        userId,
      })

      await uploadFileToS3(presignedUrl, file)
      return { updateId }
    },
    onSuccess: () => {
      useSuccessToast('File uploaded successfully. Import process started.')
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error during import process'
      useErrorToast(message)
    },
  })
}

export const useHandleImportCompletion = (
  setOpen: (open: boolean) => void,
  onResetPagination: () => void,
  onShowErrors?: (
    errors: any[],
    successCount: number,
    totalRows: number,
  ) => void,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['handle-import-completion'],
    mutationFn: async (importStatus: any) => {
      return importStatus
    },
    onSuccess: (importStatus) => {
      if (importStatus.stage === 'completed') {
        if (importStatus.errors && importStatus.errors.length > 0) {
          // * Show errors dialog instead of toast
          onShowErrors?.(
            importStatus.errors,
            importStatus.successCount,
            importStatus.totalRows,
          )
        } else {
          // * Only success toast if no errors
          useSuccessToast(
            `Import completed! ${importStatus.successCount} books imported successfully.`,
          )
        }
        onResetPagination()
        queryClient.invalidateQueries({ queryKey: ['getBooks'] })
        setOpen(false)
      } else if (importStatus.stage === 'failed') {
        useErrorToast(
          `Import failed. ${importStatus.errorCount} errors occurred.`,
        )
      }
    },
    onError: () => {
      useErrorToast('Error handling import completion')
    },
  })
}
