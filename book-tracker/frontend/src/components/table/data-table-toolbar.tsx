'use client'

import { priorities, statuses } from '@/data/data'

import { Button } from '@/components/ui/button'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { Input } from '@/components/ui/input'
import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterColumn: string
  filterPlaceholder?: string
  showViewBtn?: boolean
  showAddBtn?: boolean
  addBtnLabel?: string
  onFilterChange?: (value: string) => void
}

export function DataTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder = 'Search...',
  showViewBtn = true,
  showAddBtn = true,
  addBtnLabel = 'Add',
  onFilterChange,
}: DataTableToolbarProps<TData>) {
  const column = table.getColumn(filterColumn ?? '')
  const filterValue = (column?.getFilterValue() as string) ?? ''
  const isFiltered = table.getState().columnFilters.length > 0

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    column?.setFilterValue(value)
    onFilterChange?.(value)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={filterPlaceholder}
          value={filterValue}
          onChange={handleFilterChange}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showViewBtn && <DataTableViewOptions table={table} />}
        {showAddBtn && (
          <Button size="sm" className="h-8">
            {addBtnLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
