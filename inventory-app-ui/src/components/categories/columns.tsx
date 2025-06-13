'use client'

import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '../ui/button'
import type { Category } from '../../data/schema'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './DataTableColumnHeader'

export const columns: ColumnDef<Category>[] = [
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <div className="flex gap-2">{row.getValue('name')}</div>
    },
  },
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Label" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">{row.getValue('label')}</div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-left">Actions</div>,
    cell: () => (
      <div className="inline-flex gap-3">
        <Button
          variant="secondary"
          size="icon"
          className="table-icon-button"
          title="Edit record"
        >
          <SquarePen />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="table-icon-button"
          title="Delete record"
        >
          <Trash2 />
        </Button>
      </div>
    ),
    size: 125,
    enableSorting: false,
    enableHiding: false,
  },
]
