import { CategoriesTable } from '../components/categories/CategoriesTable'
import { HR } from 'flowbite-react'
import { createFileRoute } from '@tanstack/react-router'

export interface Category {
  id: string
  name: string
  label: string
  editAction: () => void
  deleteAction: () => void
}

export const Route = createFileRoute('/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  const headCells = ['Label', 'Name', 'Actions']
  const data: Category[] = [
    {
      id: '1234546',
      name: 'categoryOne',
      label: 'Category One',
      editAction: () => {},
      deleteAction: () => {},
    },
    {
      id: '6543210',
      name: 'categoryTwo',
      label: 'Category Two',
      editAction: () => {},
      deleteAction: () => {},
    },
  ]

  return (
    <>
      <h1 className="header-h1">Categories</h1>

      <HR className="my-4" />

      <CategoriesTable headCells={headCells} data={data} />
    </>
  )
}
