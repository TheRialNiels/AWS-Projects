import { SquarePlus, Trash2 } from 'lucide-react'

import { Button } from '@components/ui/button'

export function TableHeaderActions() {
  return (
    <>
      <Button variant="secondary" className="table-toolbar-button">
        <Trash2 />
        Delete categories
      </Button>
      <Button className="table-toolbar-button">
        <SquarePlus />
        Add category
      </Button>
    </>
  )
}
