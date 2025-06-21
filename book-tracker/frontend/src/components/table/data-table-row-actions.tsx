'use client'

import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { BookSchema, type Book } from '@/interfaces/books.types'
import type { Row } from '@tanstack/react-table'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
  editLabelBtn?: string
  deleteLabelBtn?: string
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  editLabelBtn = 'Edit record',
  deleteLabelBtn = 'Delete record',
}: DataTableRowActionsProps<TData>) {
  const task = BookSchema.parse(row.original)

  return (
    <div className="inline-flex gap-3">
      <Button
        className="size-8"
        variant="secondary"
        size="icon"
        title={editLabelBtn}
        onClick={() => onEdit(task)}
      >
        <SquarePen />
        <span className="sr-only">{editLabelBtn}</span>
      </Button>
      <Button
        className="size-8"
        variant="destructive"
        size="icon"
        title={deleteLabelBtn}
        onClick={() => onDelete(task)}
      >
        <Trash2 />
        <span className="sr-only">{deleteLabelBtn}</span>
      </Button>
    </div>
  )
}
