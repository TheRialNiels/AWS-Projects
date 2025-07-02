import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import type { ImportError } from '@/interfaces/books.types'

interface ImportErrorsDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  errors: ImportError[]
  successCount: number
}

export function ImportErrorsDialog({
  open,
  setOpen,
  errors,
  successCount,
}: ImportErrorsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle>Import Results</DialogTitle>
          <DialogDescription>
            {successCount > 0 && (
              <span className="text-green-600">
                {successCount} books imported successfully.{' '}
              </span>
            )}
            <span className="text-red-600">
              {errors.length} errors found in your CSV file.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm font-medium">Errors by row:</div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-red-50 border-red-200"
              >
                <div className="font-medium text-red-800">Row {error.row}</div>
                <div className="text-sm text-red-600 mt-1">
                  <span className="font-medium">{error.field}:</span>{' '}
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
