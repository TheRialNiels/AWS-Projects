import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h1 className="title">
        Categories
      </h1>
    </>
  )
}
