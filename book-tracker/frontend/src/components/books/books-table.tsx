import { ratings, statuses } from '@/data/data'

import {
  getBooksColumns,
  type GetBooksColumnsProps,
} from '@/components/books/columns'
import { DataTable } from '@/components/table/data-table'
import type { FacetedFilter } from '@/components/table/data-table-toolbar'
import type { Book } from '@/interfaces/books.types'

interface BooksTableProps<TData extends Book> {
  data: TData[]
  isLoading: boolean
  isError: boolean
  onEdit: (data: Book) => void
  onDelete: (id: string) => void
}

export function BooksTable<TData extends Book>({
  data,
  isLoading,
  isError,
  onEdit,
  onDelete
}: BooksTableProps<TData>) {
  const showViewBtn = false
  const columnsConfig: GetBooksColumnsProps = {
    showViewBtn,
    rowActionsStyle: 'row',
    onEdit,
    onDelete,
  }
  const columns = getBooksColumns(columnsConfig)
  const facetedFilters: FacetedFilter[] = [
    {
      key: 'status',
      title: 'Status',
      options: statuses,
    },
    {
      key: 'rating',
      title: 'Rating',
      options: ratings,
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
      showRowsSelected={false}
      rowsPerPage={[10, 20, 25]}
    />
  )
}
