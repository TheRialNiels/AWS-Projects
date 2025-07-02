'use client'

import { Button } from '@/components/ui/button'
import { taskSchema, type Task } from '@/data/schema'
import type { Row } from '@tanstack/react-table'
import { SquarePen, Trash2 } from 'lucide-react'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit: (category: Task) => void
  onDelete: (id: string) => void
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
  const task = taskSchema.parse(row.original)

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
        onClick={() => onDelete(task.id!)}
      >
        <Trash2 />
        <span className="sr-only">{deleteLabelBtn}</span>
      </Button>
    </div>
  )
}
