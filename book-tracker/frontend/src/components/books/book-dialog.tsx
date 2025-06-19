import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { Book } from '@/interfaces/books.types'
import { BookForm } from './book-form'
import { useUpdateBook } from '@/services/mutations/books.mutations'

interface BookDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  book?: Book
}

export function BookDialog({
  open,
  setOpen: setOpen,
  book: book,
}: BookDialogProps) {
  const successMsg = book
    ? 'Book updated successfully'
    : 'Book created successfully'
  const errorMsg = book
    ? 'There was an error updating the category'
    : 'There was an error creating the category'
  const { mutate, isPending } = useUpdateBook(setOpen, successMsg, errorMsg)

  const handleOnSubmit = (data: Book) => {
    // * Update existing book
    if (book) {
      mutate(data)
      return
    }

    // * Handle create logic
    console.log('Book creation logic goes here:', data)
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

        <BookForm book={book} onSubmit={handleOnSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}
