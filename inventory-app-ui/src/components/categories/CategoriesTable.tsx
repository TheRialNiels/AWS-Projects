'use client'

import * as React from 'react'

import {
  ArrowUpDown,
  SquarePen,
  SquarePlus,
  SquarePlusIcon,
  Trash2,
} from 'lucide-react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

const data: Categories[] = [
  {
    id: 'm5gr84i9',
    name: 'categoryOne',
    label: 'Category One',
  },
  {
    id: 'm5gr84i0',
    name: 'categoryTwo',
    label: 'Category two',
  },
  {
    id: 'm5gr84i9',
    name: 'categoryOne',
    label: 'Category One',
  },
  {
    id: 'm5gr84i0',
    name: 'categoryTwo',
    label: 'Category two',
  },
  {
    id: 'm5gr84i9',
    name: 'categoryOne',
    label: 'Category One',
  },
  {
    id: 'm5gr84i0',
    name: 'categoryTwo',
    label: 'Category two',
  },
  {
    id: 'm5gr84i9',
    name: 'categoryOne',
    label: 'Category One',
  },
  {
    id: 'm5gr84i0',
    name: 'categoryTwo',
    label: 'Category two',
  },
  {
    id: 'm5gr84i9',
    name: 'categoryOne',
    label: 'Category One',
  },
  {
    id: 'm5gr84i0',
    name: 'categoryTwo',
    label: 'Category two',
  },
  {
    id: 'm5gr84i9',
    name: 'categoryOne',
    label: 'Category One',
  },
  {
    id: 'm5gr84i0',
    name: 'categoryTwo',
    label: 'Category two',
  },
]

export type Categories = {
  id: string
  name: string
  label: string
}

export const columns: ColumnDef<Categories>[] = [
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
        className="inline-flex"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="inline-flex"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="cursor-pointer"
        >
          Name
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'label',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="cursor-pointer"
        >
          Label
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('label')}</div>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      const category = row.original
      console.log('🚀 ~ category:', category)

      return (
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
      )
    },
    size: 125,
    enableSorting: false,
    enableHiding: false,
  },
]

export function MainTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full pt-4">
      <div className="bg-card text-card-foreground shadow-primary rounded-md border p-4 shadow-xs">
        <div className="flex items-center justify-between h-14 pb-4">
          <Input
            placeholder="Filter categories..."
            value={(table.getColumn('label')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('label')?.setFilterValue(event.target.value)
            }
            className="main-input max-w-sm"
          />

          <div className='inline-flex gap-3 items-start h-full'>
            <Button variant="secondary" className="cursor-pointer">
              <SquarePlus />
              Delete
            </Button>

            <Button className="cursor-pointer">
              <SquarePlus />
              Add
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={
                        header.column.id === 'actions'
                          ? { width: `${header.getSize()}px` }
                          : undefined
                      }
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
            {table.getRowModel().rows?.length ? (
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
