import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/table/data-table'

interface BooksTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  isLoading: boolean
  isError: boolean
}

export function BooksTable<TData, TValue>({
  data,
  columns,
  isLoading,
  isError,
}: BooksTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={10}
      isLoading={isLoading}
      isError={isError}
      filterColumn="title"
      filterPlaceholder="Search by title..."
      addBtnLabel='Add book'
      rowsPerPage={[10, 20, 25]}
    />
  )
}
