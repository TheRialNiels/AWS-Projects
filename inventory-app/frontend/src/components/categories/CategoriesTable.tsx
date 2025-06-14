import type { Category } from '@interfaces/categories'
import { CategoryDialog } from './CategoryDialog'
import { MainTable } from '@components/common/MainTable'
import { TableHeaderActions } from './TableHeaderActions'
import { getCategoriesColumns } from '@data/categoriesColumns'
import { useState } from 'react'

interface CategoriesTableProps<TData extends Category> {
  isLoading: boolean
  data: TData[]
  isError?: boolean
}

export function CategoriesTable<TData extends Category>({
  isLoading,
  data,
  isError,
}: CategoriesTableProps<TData>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    console.log('Delete category:', id)
  }

  const columns = getCategoriesColumns({
    onEdit: handleEditCategory,
    onDelete: handleDeleteCategory,
  })

  return (
    <>
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingCategory(null)
        }}
        category={editingCategory ?? undefined}
      />

      <MainTable
        columns={columns}
        isLoading={isLoading}
        data={data}
        isError={isError}
        filterColumn="label"
        filterPlaceholder="Filter categories..."
        toolbarActions={
          <TableHeaderActions onAddCategory={() => setDialogOpen(true)} />
        }
      />
    </>
  )
}
