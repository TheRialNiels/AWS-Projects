import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCompleteImportWorkflow, useHandleImportCompletion } from '@/services/mutations/books.mutations'
import { useEffect, useState } from 'react'

import { BookFileForm } from '@/components/books/book-file-form'
import { useAuth } from '@/lib/auth-context'
import { useBooksStatus } from '@/services/queries/books.queries'

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

  const handleImportCompletion = useHandleImportCompletion(
    setOpen,
    onResetPagination,
  )

  // * Polling for import status
  const { data: importStatus } = useBooksStatus(
    updateId,
    user?.username || null,
    !!updateId
  )

  const isPending = completeImportWorkflow.isPending
  const isImporting = !!updateId && importStatus?.stage === 'processing'

  useEffect(() => {
    if (importStatus && (importStatus.stage === 'completed' || importStatus.stage === 'failed')) {
      handleImportCompletion.mutate(importStatus)
      setUpdateId(null)
    }
  }, [importStatus, handleImportCompletion])

  const handleOnSubmit = async (data: { file: File }) => {
    const result = await completeImportWorkflow.mutateAsync({
      file: data.file,
      userId: user?.username || '',
    })

    // * Set updateId to start polling
    setUpdateId(result.updateId)
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
