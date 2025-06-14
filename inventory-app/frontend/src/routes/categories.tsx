import { CategoriesTable } from '@components/categories/CategoriesTable'
import { createFileRoute } from '@tanstack/react-router'
import { useGetCategories } from '@services/queries/categoriesQueries'

export const Route = createFileRoute('/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isError, isLoading } = useGetCategories()
  const categories = data?.responseData.categories ?? []

  return (
    <>
      <h1 className="title">Categories</h1>

      <p className="text-foreground w-full pt-8 text-left">
        Here's a list of your categories. You can add, edit, or delete
        categories as needed.
      </p>

      <CategoriesTable
        isLoading={isLoading}
        data={categories}
        isError={isError}
      />
    </>
  )
}
