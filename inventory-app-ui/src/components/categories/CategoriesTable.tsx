import type { ColumnDef } from '@tanstack/react-table'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { MainTable } from '@components/common/MainTable'
import { TableHeaderActions } from './TableHeaderActions'
import { useState } from 'react'

interface CategoriesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  isLoading: boolean
  data: TData[]
  isError?: boolean
}

export function CategoriesTable<TData, TValue>({
  columns,
  isLoading,
  data,
  isError,
}: CategoriesTableProps<TData, TValue>) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <CreateCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />

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
