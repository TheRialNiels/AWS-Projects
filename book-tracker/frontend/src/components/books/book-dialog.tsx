import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useCreateBook,
  useOptimisticBook,
  useOptimisticNewBook,
  useUpdateBook,
} from '@/services/mutations/books.mutations'

import type { Book } from '@/interfaces/books.types'
import { BookForm } from './book-form'

interface BookDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onResetPagination: () => void
  book?: Book
}

export function BookDialog({
  open,
  setOpen,
  onResetPagination,
  book: book,
}: BookDialogProps) {
  const isEditMode = !!book

  const successMsg = book
    ? 'Book updated successfully'
    : 'Book created successfully'
  const errorMsg = book
    ? 'There was an error updating the category'
    : 'There was an error creating the category'
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook(
    setOpen,
    successMsg,
    errorMsg,
    onResetPagination,
  )
  const { mutate: createBook, isPending: isCreating } = useCreateBook(
    setOpen,
    successMsg,
    errorMsg,
    onResetPagination,
  )

  const optimisticBook = useOptimisticBook(book?.id ?? '')
  const optimisticNewBook = useOptimisticNewBook()
  const currentBook = isEditMode ? (optimisticBook ?? book) : optimisticNewBook

  const handleOnSubmit = (data: Book) => {
    if (isEditMode) {
      updateBook(data)
      return
    }
    createBook(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="pb-4">
          <DialogTitle>{book ? 'Edit Book' : 'Add Book'}</DialogTitle>
          <DialogDescription>
            {book
              ? 'Update the fields to modify the book.'
              : 'Fill out the form to add a new book.'}
          </DialogDescription>
        </DialogHeader>

        <BookForm
          book={currentBook}
          onSubmit={handleOnSubmit}
          isPending={isEditMode ? isUpdating : isCreating}
        />
      </DialogContent>
    </Dialog>
  )
}
