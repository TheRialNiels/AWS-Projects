import { SquarePenIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@components/ui/button'
import type { Category } from '@interfaces/categories'
import { Checkbox } from '@components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { MainTableColumnHeader } from '@components/common/MainTableColumnHeader'

interface CategoriesColumnsOptions {
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function getCategoriesColumns({
  onEdit,
  onDelete,
}: CategoriesColumnsOptions): ColumnDef<Category>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="inline-flex translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="inline-flex translate-y-[2px]"
        />
      ),
      size: 50,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <MainTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div className="flex gap-2">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'label',
      header: ({ column }) => (
        <MainTableColumnHeader column={column} title="Label" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.getValue('label')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className="inline-flex gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="table-icon-button"
              title="Edit record"
              onClick={() => onEdit(category)}
            >
              <SquarePenIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="table-icon-button"
              title="Delete record"
              onClick={() => onDelete(category.id!)}
            >
              <Trash2Icon />
            </Button>
          </div>
        )
      },
      size: 125,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
