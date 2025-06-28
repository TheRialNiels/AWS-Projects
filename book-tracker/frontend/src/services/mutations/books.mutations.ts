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
      const message = error?.response?.data?.message || 'Error generating upload URL'
      useErrorToast(message)
    },
  })
}

export const useUploadFile = () => {
  return useMutation({
    mutationKey: ['upload-file'],
    mutationFn: ({ presignedUrl, file }: { presignedUrl: string; file: File }) =>
      uploadFileToS3(presignedUrl, file),
    onError: (error: any) => {
      useErrorToast('Error uploading file')
    },
  })
}

// TODO: Complete import workflow mutation - handles the entire process
export const useCompleteImportWorkflow = (
  setOpen: (open: boolean) => void,
  onResetPagination?: () => void,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['complete-import-workflow'],
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      // Step 1: Generate presigned URL
      const { updateId, presignedUrl } = await generatePresignedUrlApi({ userId })

      // Step 2: Upload file to S3
      await uploadFileToS3(presignedUrl, file)

      // TODO: Step 3: Trigger import process (when backend endpoint is ready)
      // await triggerImportApi(updateId)

      return { updateId }
    },
    onSuccess: ({ updateId }) => {
      useSuccessToast('File uploaded successfully. Import process started.')
      // TODO: Start polling for status instead of closing immediately
      // For now, close the dialog
      setOpen(false)
      onResetPagination?.()
      queryClient.invalidateQueries({ queryKey: ['getBooks'] })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error during import process'
      useErrorToast(message)
    },
  })
}

// TODO: Add mutation for handling import completion with optimistic updates
// export const useHandleImportCompletion = (
//   setOpen: (open: boolean) => void,
//   onResetPagination?: () => void,
// ) => {
//   return useOptimisticMutation<Book[], { updateId: string; importedBooks: Book[] }>({
//     mutationKey: ['handle-import-completion'],
//     queryKey: ['getBooks'],
//     getId: () => 'import-completion', // Special case for bulk operations
//     mutationFn: async ({ importedBooks }) => ({ responseData: importedBooks }),
//     getItems: (data: GetBooksResponse) => data.responseData.books,
//     setItems: (newBooks, oldData: GetBooksResponse) => ({
//       ...oldData,
//       responseData: {
//         ...oldData.responseData,
//         books: newBooks,
//       },
//     }),
//     updateItems: (prevBooks, { importedBooks }) => [...importedBooks, ...prevBooks],
//     successMsg: 'Books imported successfully!',
//     errorMsg: 'Error completing import',
//     onDone: () => {
//       onResetPagination?.()
//       setOpen(false)
//     },
//   })
// }
