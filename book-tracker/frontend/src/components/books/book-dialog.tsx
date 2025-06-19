import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { Book } from '@/interfaces/books.types'
import { BookForm } from './book-form'

// import { useErrorToast, useSuccessToast } from '@/lib/toastify'

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
  const handleOnSubmit = (data: Book) => {
    
    // * Close dialog
    setOpen(false)
    // * Show success alert
    // useSuccessToast(
    //   book ? 'Book updated successfully' : 'Book created successfully',
    // )
    console.log('Book data submitted:', data)
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

        <BookForm book={book} />
      </DialogContent>
    </Dialog>
  )
}
