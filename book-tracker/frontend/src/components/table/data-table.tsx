'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'

import { useEffect, useState } from 'react'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar, type FacetedFilter } from './data-table-toolbar'
import { SearchXIcon, TriangleAlertIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumn: string
  hasNextPage: boolean
  isError: boolean
  isLoading: boolean
  pageSize: number
  rowsPerPage: number[]
  onNextPage: () => void
  onPrevPage: () => void
  setPageSize: (size: number) => void
  addBtnLabel?: string
  errorMsg?: string
  facetedFilters?: FacetedFilter[]
  filterPlaceholder?: string
  noResultsMsg?: string
  showAddBtn?: boolean
  showPageCount?: boolean
  showRowsSelected?: boolean
  showViewBtn?: boolean
  onAdd?: () => void
  onImport?: () => void
  onSelectionChange?: (selected: TData[]) => void
  onClearSelectionRef?: (fn: () => void) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  hasNextPage,
  isError,
  isLoading,
  pageSize,
  rowsPerPage,
  onNextPage,
  onPrevPage,
  setPageSize,
  addBtnLabel,
  errorMsg = 'There was an error fetching the data',
  facetedFilters,
  filterPlaceholder,
  noResultsMsg = 'No results',
  showAddBtn,
  showPageCount,
  showRowsSelected,
  showViewBtn,
  onAdd,
  onImport,
  onSelectionChange,
  onClearSelectionRef,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: -1,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)

  // * Notify parent when selection changes
  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [selectedRows.length])

  useEffect(() => {
    if (onClearSelectionRef) {
      onClearSelectionRef(() => {
        table.resetRowSelection()
      })
    }
  }, [table, onClearSelectionRef])

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        filterColumn={filterColumn}
        filterPlaceholder={filterPlaceholder}
        facetedFilters={facetedFilters}
        showViewBtn={showViewBtn}
        showAddBtn={showAddBtn}
        addBtnLabel={addBtnLabel}
        onAdd={onAdd}
        onImport={onImport}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // * Show placeholder skeleton rows
              [...Array(pageSize)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-muted-foreground"
                >
                  <span className="flex items-center justify-center gap-1">
                    <TriangleAlertIcon />
                    {errorMsg}
                  </span>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-muted-foreground"
                >
                  <span className="flex items-center justify-center gap-1">
                    <SearchXIcon />
                    {noResultsMsg}
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        rowsPerPage={rowsPerPage}
        showPageCount={showPageCount}
        showRowsSelected={showRowsSelected}
        table={table}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        setPageSize={setPageSize}
      />
    </div>
  )
}
