import type { Book } from '../interfaces/books.types'
import { BookDialog } from '@/components/books/book-dialog'
import { BooksTable } from '@/components/books/books-table'
import { createFileRoute } from '@tanstack/react-router'
import { useGetBooks } from '@/services/queries/books.queries'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editBook, setEditBook] = useState<Book | null>(null)
  const { data, isError, isLoading } = useGetBooks()
  const books = data?.responseData.books ?? []

  const handleSetDialogOpen = (open: boolean) => {
    setDialogOpen(open)
  }

  const handleAddBook = () => {
    setEditBook(null)
    setDialogOpen(true)
  }

  const handleEditBook = (book: Book) => {
    setEditBook(book)
    setDialogOpen(true)
  }

  const handleDeleteBook = (id: string) => {
    console.log('Delete book:', id)
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider border-primary border-b pb-2">
        Books
      </h1>

      <p className="w-full pt-4 pb-8 text-left">
        Here's a list of your books. You can add, edit, or delete books as
        needed.
      </p>

      <BooksTable
        data={books}
        isLoading={isLoading}
        isError={isError}
        onAdd={handleAddBook}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
      />

      <BookDialog
        open={dialogOpen}
        book={editBook ?? undefined}
        setOpen={handleSetDialogOpen}
      />
    </>
  )
}
