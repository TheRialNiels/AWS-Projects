import { CategoriesTable } from '@components/categories/CategoriesTable'
import type { Category } from '@data/schema'
import { categoriesColumns } from '@data/categoriesColumns'
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
        Here's a list of your categories. You can add, edit, or delete
        categories as needed.
      </p>

      <CategoriesTable data={data} columns={categoriesColumns} />
    </>
  )
}
