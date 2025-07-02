import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import type { Table } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  showRowsSelected?: boolean
  rowsPerPage?: number[]
  showPageCount?: boolean
  onNextPage: () => void
  onPrevPage: () => void
  hasNextPage: boolean
  pageSize: number
  setPageSize: (size: number) => void
}

export function DataTablePagination<TData>({
  table,
  showRowsSelected = true,
  rowsPerPage = [10, 20, 30, 40, 50],
  showPageCount = true,
  onNextPage,
  onPrevPage,
  hasNextPage,
  pageSize,
  setPageSize,
}: DataTablePaginationProps<TData>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center',
        !showRowsSelected ? 'md:justify-end' : null,
      )}
    >
      {showRowsSelected && (
        <div className="text-muted-foreground w-full text-center text-sm md:flex-1 md:text-start">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}

      <div
        className={cn(
          'flex flex-col items-center gap-4 sm:flex-row md:space-x-6 lg:space-x-8',
          !showRowsSelected ? 'sm:justify-end' : 'sm:justify-center',
        )}
      >
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[75px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {rowsPerPage.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          {showPageCount && (
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
          )}
          <div className="flex items-center space-x-2">
            {showPageCount && (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={onPrevPage}
              disabled={!onPrevPage}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={onNextPage}
              disabled={!hasNextPage}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            {showPageCount && (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
