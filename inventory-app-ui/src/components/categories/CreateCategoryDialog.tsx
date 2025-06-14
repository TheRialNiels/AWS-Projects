import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CreateCategoryForm } from './CreateCategoryForm'
import { useSuccessToast } from '@lib/toastify'

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
}: CreateCategoryDialogProps) {
  const onSuccess = () => {
    // * Close dialog
    onOpenChange(false)

    // * Show success alert
    useSuccessToast('Category created successfully')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pb-4">
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new category.
          </DialogDescription>
        </DialogHeader>

        <CreateCategoryForm handleOnSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
