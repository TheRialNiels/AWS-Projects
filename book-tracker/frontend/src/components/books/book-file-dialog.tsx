import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { BookFileForm } from '@/components/books/book-file-form'
import { useAuth } from '@/lib/auth-context'
import { useCompleteImportWorkflow } from '@/services/mutations/books.mutations'
import { useImportStatus } from '@/services/queries/books.queries'
import { useState } from 'react'

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
  const [updateId, setUpdateId] = useState<string | null>(null)
  const { user } = useAuth()

  const completeImportWorkflow = useCompleteImportWorkflow(
    setOpen,
    onResetPagination,
  )

  // TODO: Enable when backend endpoint is ready - polling for import status
  const { data: importStatus } = useImportStatus(updateId, !!updateId)

  const isPending = completeImportWorkflow.isPending
  const isImporting = !!updateId && importStatus?.stage === 'processing'

  const handleOnSubmit = async (data: { file: File }) => {
    const result = await completeImportWorkflow.mutateAsync({
      file: data.file,
      userId: user?.username || '',
    })
    console.log('🚀 ~ handleOnSubmit ~ result:', result)

    // TODO: Set updateId to start polling when backend is ready
    // setUpdateId(result.updateId)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="pb-4">
          <DialogTitle>Import books</DialogTitle>
          <DialogDescription>Add new books from a CSV file.</DialogDescription>
        </DialogHeader>

        <BookFileForm
          onSubmit={handleOnSubmit}
          isPending={isPending}
          isImporting={isImporting}
          importStatus={importStatus}
        />
      </DialogContent>
    </Dialog>
  )
}
