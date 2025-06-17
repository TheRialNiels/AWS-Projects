import { priorities, statuses } from '@/data/data'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/table/data-table'
import type { FacetedFilter } from '@/components/table/data-table-toolbar'

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
  const facetedFilters: FacetedFilter[] = [
    {
      key: 'status',
      title: 'Status',
      options: statuses,
    },
    {
      key: 'priority',
      title: 'Priority',
      options: priorities,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={10}
      isLoading={isLoading}
      isError={isError}
      filterColumn="title"
      filterPlaceholder="Search by title..."
      facetedFilters={facetedFilters}
      addBtnLabel="Add book"
      rowsPerPage={[10, 20, 25]}
    />
  )
}
