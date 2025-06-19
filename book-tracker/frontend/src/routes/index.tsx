import { BooksTable } from '@/components/books/books-table'
import { createFileRoute } from '@tanstack/react-router'
import { useGetBooks } from '@/services/queries/books.queries'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data, isError, isLoading } = useGetBooks()
  const books = data?.responseData.books ?? []

  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider border-primary border-b pb-2">
        Books
      </h1>

      <p className="w-full pt-4 pb-8 text-left">
        Here's a list of your books. You can add, edit, or delete books as
        needed.
      </p>

      <BooksTable data={books} isLoading={isLoading} isError={isError} />
    </>
  )
}
