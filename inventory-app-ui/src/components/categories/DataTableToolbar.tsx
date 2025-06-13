'use client'

import { SquarePlus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Table } from '@tanstack/react-table'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex h-auto w-full flex-col gap-4 sm:h-10 sm:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filter categories..."
          value={(table.getColumn('label')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('label')?.setFilterValue(event.target.value)
          }
          className="h-10 w-full md:max-w-sm"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            className="table-toolbar-button"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>

      <div className="flex h-full flex-col gap-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" className="table-toolbar-button">
          <Trash2 />
          Delete records
        </Button>

        <Button className="table-toolbar-button">
          <SquarePlus />
          Add Category
        </Button>
      </div>
    </div>
  )
}
