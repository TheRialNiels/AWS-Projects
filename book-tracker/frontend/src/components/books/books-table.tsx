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
  hasNextPage: boolean
  isError: boolean
  isLoading: boolean
  pageSize: number
  onAdd: () => void
  onDelete: (data: Book) => void
  onEdit: (data: Book) => void
  onNextPage: () => void
  onPrevPage: () => void
  setPageSize: (size: number) => void
  onSelectionChange?: (selected: TData[]) => void
  onClearSelectionRef?: (fn: () => void) => void
}

export function BooksTable<TData extends Book>({
  data,
  hasNextPage,
  isLoading,
  isError,
  pageSize,
  onAdd,
  onEdit,
  onDelete,
  onNextPage,
  onPrevPage,
  setPageSize,
  onSelectionChange,
  onClearSelectionRef
}: BooksTableProps<TData>) {
  const showViewBtn = false
  const columnsConfig: GetBooksColumnsProps = {
    showViewBtn,
    rowActionsStyle: 'row',
    onEdit,
    onDelete,
  }
  const columns = getBooksColumns<TData>(columnsConfig)
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
      addBtnLabel="Add book"
      columns={columns}
      data={data}
      facetedFilters={facetedFilters}
      filterColumn="title"
      filterPlaceholder="Search by title..."
      hasNextPage={hasNextPage}
      showPageCount={false}
      isError={isError}
      isLoading={isLoading}
      onAdd={onAdd}
      onNextPage={onNextPage}
      onPrevPage={onPrevPage}
      pageSize={pageSize}
      rowsPerPage={[10, 20, 25]}
      setPageSize={setPageSize}
      showRowsSelected={false}
      showViewBtn={showViewBtn}
      onSelectionChange={onSelectionChange}
      onClearSelectionRef={onClearSelectionRef}
    />
  )
}
