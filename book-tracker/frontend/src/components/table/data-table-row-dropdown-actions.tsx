'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { BookSchema } from '@/interfaces/books.types'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import type { Row } from '@tanstack/react-table'

interface DataTableRowDropdownActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowDropdownActions<TData>({
  row,
}: DataTableRowDropdownActionsProps<TData>) {
  const book = BookSchema.parse(row.original)
  console.log('🚀 ~ book:', book)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
