import { useRef, useState } from 'react'

import type { Book } from '@/interfaces/books.types'
import { BookDeleteDialog } from '@/components/books/book-delete-dialog'
import { BookDialog } from '@/components/books/book-dialog'
import { BookFileDialog } from '../components/books/book-file-dialog'
import { BooksPopup } from '../components/books/books-popup'
import { BooksTable } from '@/components/books/books-table'
import { createFileRoute } from '@tanstack/react-router'
import { usePaginatedBooks } from '@/services/queries/books.queries'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [bookDeleteDialogOpen, setBookDeleteDialogOpen] = useState(false)
  const [bookFileDialogOpen, setBookFileDialogOpen] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([])
  const [book, setBook] = useState<Book | null>(null)
  const {
    data,
    isError,
    isLoading,
    pageSize,
    setCursor,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
  } = usePaginatedBooks()
  const clearSelectionRef = useRef<() => void>(null)
  const books = data?.responseData.books ?? []

  const handleSetDialogOpen = (open: boolean) => {
    setBookDialogOpen(open)
  }

  const handleSetBookDeleteDialogOpen = (open: boolean) => {
    setBookDeleteDialogOpen(open)
  }

  const handleSetBookFileDialogOpen = (open: boolean) => {
    setBookFileDialogOpen(open)
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
    setBookDeleteDialogOpen(true)
  }

  const handleFileBook = () => {
    setBookFileDialogOpen(true)
  }

  const handleClearSelection = () => {
    clearSelectionRef.current?.()
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
        hasNextPage={hasNextPage}
        isError={isError}
        isLoading={isLoading}
        pageSize={pageSize}
        onAdd={handleAddBook}
        onDelete={handleDeleteBook}
        onEdit={handleEditBook}
        onImport={handleFileBook}
        onNextPage={goToNextPage}
        onPrevPage={goToPreviousPage}
        setPageSize={setPageSize}
        onSelectionChange={setSelectedBooks}
        onClearSelectionRef={(fn) => {
          clearSelectionRef.current = fn
        }}
      />

      {selectedBooks.length > 0 && (
        <BooksPopup
          selectedBooks={selectedBooks}
          onClearSelection={handleClearSelection}
        />
      )}

      <BookDialog
        open={bookDialogOpen}
        book={book ?? undefined}
        setOpen={handleSetDialogOpen}
        onResetPagination={() => setCursor(null)}
      />

      <BookDeleteDialog
        open={bookDeleteDialogOpen}
        book={book as Book}
        setOpen={handleSetBookDeleteDialogOpen}
        onResetPagination={() => setCursor(null)}
      />

      <BookFileDialog
        open={bookFileDialogOpen}
        setOpen={handleSetBookFileDialogOpen}
        onResetPagination={() => setCursor(null)}
      />
    </>
  )
}
