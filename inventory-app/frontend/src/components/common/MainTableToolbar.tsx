'use client'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

export interface MainTableToolbarProps<TData> {
  table: Table<TData>
  filterColumn: string
  filterPlaceholder?: string
  onFilterChange?: (value: string) => void
  actions?: React.ReactNode
}

export function MainTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder = 'Filter...',
  onFilterChange,
  actions,
}: MainTableToolbarProps<TData>) {
  const column = table.getColumn(filterColumn ?? '')
  const filterValue = (column?.getFilterValue() as string) ?? ''
  const isFiltered = table.getState().columnFilters.length > 0

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    column?.setFilterValue(value)
    onFilterChange?.(value)
  }

  return (
    <div className="flex h-auto w-full flex-col gap-4 sm:h-10 sm:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={filterPlaceholder}
          value={filterValue}
          onChange={handleFilterChange}
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

      {actions && (
        <div className="flex h-full flex-col gap-4 sm:flex-row sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  )
}
