import { ratings, statuses } from '@/data/data'

import type { Book } from '@/interfaces/books.types'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { DataTableRowActions } from '@/components/table/data-table-row-actions'
import { DataTableRowDropdownActions } from '@/components/table/data-table-row-dropdown-actions'

export interface GetBooksColumnsProps {
  showViewBtn: boolean
  rowActionsStyle: RowActionsStyles
  onEdit: (data: Book) => void
  onDelete: (data: Book) => void
}

type RowActionsStyles = 'row' | 'dropdown'

export function getBooksColumns({
  showViewBtn = true,
  rowActionsStyle = 'row',
  onEdit,
  onDelete,
}: GetBooksColumnsProps): ColumnDef<Book>[] {
  return [
    /*{
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },*/
    {
      accessorKey: 'title',
      size: 400,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          column={column}
          title="Title"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 pl-2">
            <span className="truncate font-medium">
              {row.getValue('title')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'author',
      size: 300,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Author"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => <div>{row.getValue('author')}</div>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue('status'),
        )
        if (!status) return null
        return (
          <div className="flex items-center gap-2">
            {status.icon && (
              <status.icon className="text-muted-foreground size-4" />
            )}
            <span>{status.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Rating"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => {
        const rowRating: number = row.getValue('rating')
        const rating = ratings.find((rating) => rating.value === rowRating)
        if (!rating) return null
        return (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 text-muted-foreground"
              title={rating.label}
            >
              {Array.from({ length: rowRating }, (_, i) => (
                <rating.icon key={i} className="size-4" />
              ))}
            </div>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'actions',
      size: 100,
      cell: ({ row }) =>
        rowActionsStyle === 'row' ? (
          <DataTableRowActions
            row={row}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ) : (
          <DataTableRowDropdownActions row={row} />
        ),
    },
  ]
}
