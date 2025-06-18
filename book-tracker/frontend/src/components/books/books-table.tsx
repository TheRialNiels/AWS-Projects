import { priorities, statuses } from '@/data/data'

import { DataTable } from '@/components/table/data-table'
import type { FacetedFilter } from '@/components/table/data-table-toolbar'
import type { Task } from '@/data/schema'
import { getTaskColumns } from '@/components/table/columns'

interface BooksTableProps<TData extends Task> {
  data: TData[]
  isLoading: boolean
  isError: boolean
}

export function BooksTable<TData extends Task>({
  data,
  isLoading,
  isError,
}: BooksTableProps<TData>) {
  const showViewBtn = false
  const columns = getTaskColumns(showViewBtn)
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
      showViewBtn={showViewBtn}
      addBtnLabel="Add book"
      rowsPerPage={[10, 20, 25]}
    />
  )
}
