import { MainTable } from '@/components/categories/CategoriesTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h1 className="title">Categories</h1>

      <p className="text-foreground w-full pt-8 text-left">
        Here's a list of your categories. You can add, edit, or delete categories as needed.
      </p>

      <MainTable />
    </>
  )
}
