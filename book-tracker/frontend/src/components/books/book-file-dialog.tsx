import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { BookFileForm } from './book-file-form'
import { useImportBooks } from '../../services/mutations/books.mutations'

interface BookFileDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onResetPagination: () => void
}

export function BookFileDialog({
  open,
  setOpen,
  onResetPagination,
}: BookFileDialogProps) {
  const successMsg = 'Books imported successfully'
  const errorMsg = 'There was an error importing the books'

  const { mutate: importBooks, isPending } = useImportBooks(
    setOpen,
    successMsg,
    errorMsg,
    onResetPagination,
  )

  const handleOnSubmit = (data: { file: File }) => {
    importBooks(data.file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="pb-4">
          <DialogTitle>Import books</DialogTitle>
          <DialogDescription>Add new books from a CSV file.</DialogDescription>
        </DialogHeader>

        <BookFileForm onSubmit={handleOnSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}
