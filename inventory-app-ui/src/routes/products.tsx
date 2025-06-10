import { HR } from 'flowbite-react'
import { ProductsTable } from '../components/products/ProductsTable'
import { createFileRoute } from '@tanstack/react-router'

export interface Product {
  sku: string
  name: string
  category: string
  quantity: number
  price: number
  editAction: () => void
  deleteAction: () => void
}

export const Route = createFileRoute('/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const headCells = [
    'SKU',
    'Product name',
    'Category',
    'Quantity',
    'Price',
    'Actions',
  ]
  const data: Product[] = [
    {
      sku: 'abc-1234546',
      name: 'Apple MacBook Pro 17"',
      category: 'Laptop',
      quantity: 999,
      price: 2999,
      editAction: () => {},
      deleteAction: () => {},
    },
    {
      sku: 'def-6543210',
      name: 'Dell XPS 15',
      category: 'Laptop',
      quantity: 500,
      price: 1999,
      editAction: () => {},
      deleteAction: () => {},
    },
  ]

  return (
    <>
      <h1 className="header-h1">Products</h1>

      <HR className="my-4" />

      <ProductsTable headCells={headCells} data={data} />
    </>
  )
}
