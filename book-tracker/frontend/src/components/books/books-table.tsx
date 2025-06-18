import { priorities, statuses } from '@/data/data'

import { DataTable } from '@/components/table/data-table'
import type { FacetedFilter } from '@/components/table/data-table-toolbar'
import type { Task } from '@/data/schema'
import { getTaskColumns, type GetTaskColumnsProps } from '@/components/table/columns'

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
  const onEdit = (row: Task) => {
    console.log('🚀 ~ onEdit ~ row:', row)
  }
  const onDelete = (id: string) => {
    console.log('🚀 ~ onDelete ~ id:', id)
  }

  const showViewBtn = false
  const columnsConfig: GetTaskColumnsProps = {
    showViewBtn,
    rowActionsStyle: 'row',
    onEdit,
    onDelete
  }
  const columns = getTaskColumns(columnsConfig)
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
