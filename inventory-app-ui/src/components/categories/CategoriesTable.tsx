import type { ColumnDef } from '@tanstack/react-table'
import { MainTable } from '@components/common/MainTable'
import { TableHeaderActions } from './TableHeaderActions'

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
  isError
}: CategoriesTableProps<TData, TValue>) {
  return (
    <MainTable
      columns={columns}
      isLoading={isLoading}
      data={data}
      isError={isError}
      filterColumn="label"
      filterPlaceholder="Filter categories..."
      toolbarActions={TableHeaderActions()}
    />
  )
}
