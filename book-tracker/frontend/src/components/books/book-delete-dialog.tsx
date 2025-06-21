import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { Book } from '@/interfaces/books.types'
import { Button } from '@/components/ui/button'
import { useDeleteBook } from '@/services/mutations/books.mutations'

interface BookDeleteDialogProps {
  open: boolean
  book: Book
  setOpen: (open: boolean) => void
}

export function BookDeleteDialog({
  open,
  book,
  setOpen: setOpen,
}: BookDeleteDialogProps) {
  const { mutate: deleteBook, isPending } = useDeleteBook(
    setOpen,
    'Book deleted successfully',
    'There was an error deleting the book',
  )

  const handleDelete = () => {
    if (!book) return
    deleteBook(book)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="pb-4">
          <DialogTitle>Delete Book</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the book "{book?.title}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
