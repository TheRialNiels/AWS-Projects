import type { Category } from '../data/schema'
import { MainTable2 } from '@components/categories/CategoriesTable2'
import { columns } from '@components/categories/columns'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories')({
  component: RouteComponent,
})

function RouteComponent() {
const data: Category[] = [
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

  return (
    <>
      <h1 className="title">Categories</h1>

      <p className="text-foreground w-full pt-8 text-left">
        Here's a list of your categories. You can add, edit, or delete categories as needed.
      </p>

      <MainTable2 data={data} columns={columns}/>
    </>
  )
}
