import { SquarePlus, Trash2 } from 'lucide-react'

import { Button } from '@components/ui/button'

interface TableHeaderActionsProps {
  onAddCategory: () => void
}

export function TableHeaderActions({ onAddCategory }: TableHeaderActionsProps) {
  return (
    <>
      <Button variant="secondary" className="table-toolbar-button">
        <Trash2 />
        Delete categories
      </Button>
      <Button className="table-toolbar-button" onClick={onAddCategory}>
        <SquarePlus />
        Add category
      </Button>
    </>
  )
}
