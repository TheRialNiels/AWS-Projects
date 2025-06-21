import type { Book } from '../interfaces/books.types'
import { BookDeleteDialog } from '../components/books/book-delete-dialog'
import { BookDialog } from '@/components/books/book-dialog'
import { BooksTable } from '@/components/books/books-table'
import { createFileRoute } from '@tanstack/react-router'
import { useGetBooks } from '@/services/queries/books.queries'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [bookDeleteOpen, setBookDeleteOpen] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const { data, isError, isLoading } = useGetBooks()
  const books = data?.responseData.books ?? []

  const handleSetDialogOpen = (open: boolean) => {
    setBookDialogOpen(open)
  }

  const handleSetBookDeleteDialogOpen = (open: boolean) => {
    setBookDeleteOpen(open)
  }

  const handleAddBook = () => {
    setBook(null)
    setBookDialogOpen(true)
  }

  const handleEditBook = (book: Book) => {
    setBook(book)
    setBookDialogOpen(true)
  }

  const handleDeleteBook = (book: Book) => {
    setBook(book)
    setBookDeleteOpen(true)
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
        open={bookDialogOpen}
        book={book ?? undefined}
        setOpen={handleSetDialogOpen}
      />

      <BookDeleteDialog
        open={bookDeleteOpen}
        book={book as Book}
        setOpen={handleSetBookDeleteDialogOpen}
      />
    </>
  )
}
