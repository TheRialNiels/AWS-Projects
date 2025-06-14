import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CategoryForm } from './CategoryForm'
import { useSuccessToast } from '@lib/toastify'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
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

        <CategoryForm handleOnSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
