import { labels, priorities, statuses } from '@/data/data'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { DataTableRowDropdownActions } from './data-table-row-dropdown-actions'
import type { Task } from '@/data/schema'

export interface GetTaskColumnsProps {
  showViewBtn: boolean
  rowActionsStyle: RowActionsStyles
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

type RowActionsStyles = 'row' | 'dropdown'

export function getTaskColumns({
  showViewBtn = true,
  rowActionsStyle = 'row',
  onEdit,
  onDelete,
}: GetTaskColumnsProps): ColumnDef<Task>[] {
  return [
    {
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
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Task"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => <div className="w-[80px]">{row.getValue('id')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Title"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => {
        const label = labels.find((label) => label.value === row.original.label)

        return (
          <div className="flex gap-2">
            {label && <Badge variant="outline">{label.label}</Badge>}
            <span className="max-w-[300px] truncate font-medium">
              {row.getValue('title')}
            </span>
          </div>
        )
      },
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
          <div className="flex w-[100px] items-center gap-2">
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
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Priority"
          showViewBtn={showViewBtn}
        />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue('priority'),
        )
        if (!priority) return null
        return (
          <div className="flex items-center gap-2">
            {priority.icon && (
              <priority.icon className="text-muted-foreground size-4" />
            )}
            <span>{priority.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        rowActionsStyle === 'row' ? (
          <DataTableRowActions
            row={row}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.id)}
          />
        ) : (
          <DataTableRowDropdownActions row={row} />
        ),
    },
  ]
}
