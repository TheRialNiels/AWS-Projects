import { HR } from 'flowbite-react'
import { MainTable } from '../components/common/MainTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <h1 className="header-h1">Products</h1>

      <HR className="my-4" />

      <MainTable />
    </>
  )
}
