'use client'

import { Button } from '@/components/ui/button'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { Input } from '@/components/ui/input'
import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterColumn: string
  filterPlaceholder?: string
  facetedFilters?: FacetedFilter[]
  showViewBtn?: boolean
  showAddBtn?: boolean
  addBtnLabel?: string
  onFilterChange?: (value: string) => void
  onAdd?: () => void
}

export interface FacetedFilter {
  key: string
  title: string
  options: FilterOptions[]
}

export interface FilterOptions {
  label: string
  value: string | number
  icon?: React.ComponentType<{ className?: string }>
}

export function DataTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder = 'Search...',
  facetedFilters,
  showViewBtn = true,
  showAddBtn = true,
  addBtnLabel = 'Add',
  onFilterChange,
  onAdd,
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
    <div className="flex gap-4 items-start justify-between">
      <div className="flex flex-wrap flex-1 items-center gap-2">
        <Input
          placeholder={filterPlaceholder}
          value={filterValue}
          onChange={handleFilterChange}
          className="h-8 w-full max-w-xs sm:max-w-[15rem]"
        />
        {facetedFilters?.map(
          ({ key, title, options }) =>
            table.getColumn(key) && (
              <DataTableFacetedFilter
                key={key}
                column={table.getColumn(key)!}
                title={title}
                options={options}
              />
            ),
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
      {(showViewBtn || showAddBtn) && (
        <div
          className={cn(
            'flex items-center gap-2',
            showViewBtn && !showAddBtn && 'hidden md:flex',
          )}
        >
          {showViewBtn && <DataTableViewOptions table={table} />}
          {showAddBtn && (
            <Button size="sm" className="h-8" onClick={() => onAdd?.()}>
              {addBtnLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
