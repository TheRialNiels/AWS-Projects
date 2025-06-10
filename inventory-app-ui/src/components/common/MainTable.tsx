import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'

export function MainTable() {
  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell className="p-4">
              <Checkbox />
            </TableHeadCell>
            <TableHeadCell>SKU</TableHeadCell>
            <TableHeadCell>Product name</TableHeadCell>
            <TableHeadCell>Category</TableHeadCell>
            <TableHeadCell>Quantity</TableHeadCell>
            <TableHeadCell>Price</TableHeadCell>
            <TableHeadCell>
              <span className="sr-only">Edit</span>
            </TableHeadCell>
          </TableRow>
        </TableHead>

        <TableBody className="divide-y">
          <TableRow className="bg-primary dark:border-primary-dark-700 dark:bg-primary-dark-800">
            <TableCell className="p-4">
              <Checkbox />
            </TableCell>
            <TableCell className="font-medium whitespace-nowrap text-primary-dark-900 dark:text-primary">
              Apple MacBook Pro 17"
            </TableCell>
            <TableCell>Sliver</TableCell>
            <TableCell>Laptop</TableCell>
            <TableCell>999</TableCell>
            <TableCell>$2999</TableCell>
            <TableCell>
              <a
                href="#"
                className="text-primary-600 dark:text-primary-500 font-medium hover:underline"
              >
                Edit
              </a>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
