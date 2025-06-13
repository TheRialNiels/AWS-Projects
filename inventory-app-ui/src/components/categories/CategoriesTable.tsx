import type { ColumnDef } from '@tanstack/react-table'
import { MainTable } from '@components/common/MainTable'
import { TableHeaderActions } from './TableHeaderActions'

interface CategoriesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function CategoriesTable<TData, TValue>({
  columns,
  data,
}: CategoriesTableProps<TData, TValue>) {
  return (
    <MainTable
      columns={columns}
      data={data}
      filterColumn="label"
      filterPlaceholder="Filter categories..."
      toolbarActions={TableHeaderActions()}
    />
  )
}
