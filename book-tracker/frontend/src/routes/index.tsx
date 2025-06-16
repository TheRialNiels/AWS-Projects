import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider border-primary border-b pb-2">
      Books
      </h1>

      <p className="w-full pt-8 text-left">
        Here's a list of your books. You can add, edit, or delete
        books as needed.
      </p>
    </>
  )
}
