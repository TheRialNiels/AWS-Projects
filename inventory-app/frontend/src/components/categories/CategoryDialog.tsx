import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useErrorToast, useSuccessToast } from '@lib/toastify'

import type { Category } from '@interfaces/categories'
import { CategoryForm } from './CategoryForm'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const onSuccess = () => {
    // * Close dialog
    onOpenChange(false)

    // * Show success alert
    useSuccessToast(
      category
        ? 'Category updated successfully'
        : 'Category created successfully',
    )
  }

  const onError = () => {
    // * Close dialog
    onOpenChange(false)

    // * Show error alert
    useErrorToast(
      category
        ? 'There was an error updating the category'
        : 'There was an error creating the category',
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pb-4">
          <DialogTitle>
            {category ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Update the fields to modify the category.'
              : 'Fill out the form to create a new category.'}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          category={category}
          handleOnSuccess={onSuccess}
          handleOnError={onError}
        />
      </DialogContent>
    </Dialog>
  )
}
