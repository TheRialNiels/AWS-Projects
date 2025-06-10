import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'

import { Category } from '../../routes/categories'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import { HiOutlineTrash } from 'react-icons/hi'

interface Props {
  headCells: string[]
  data: Category[]
}

export function CategoriesTable(props: Props) {
  const btnParams = {
    class:
      'text-primary-500! hover:bg-primary-100 focus:ring-primary-200 dark:text-primary-400! dark:hover:bg-primary-dark-700! dark:focus:ring-primary-dark-700 w-10 cursor-pointer rounded-lg border-none p-2.5 text-sm focus:ring-2 focus:outline-none',
    iconSize: 22.5,
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            {props.headCells.map((cell) => (
              <TableHeadCell key={cell} className="bg-primary-400">
                {cell}
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody className="divide-y">
          {props.data.map((item) => (
            <TableRow
              key={item.id}
              className="bg-primary dark:border-primary-dark-700 dark:bg-primary-dark-800"
            >
              <TableCell className="text-primary-dark-900 dark:text-primary font-medium whitespace-nowrap">
                {item.label}
              </TableCell>
              <TableCell> {item.name}</TableCell>

              <TableCell className="justify-left flex items-center gap-2">
                <Button
                  onClick={item.editAction}
                  outline
                  className={btnParams.class}
                >
                  <HiOutlinePencilAlt size={btnParams.iconSize} />
                </Button>

                <Button
                  onClick={item.deleteAction}
                  outline
                  className={btnParams.class}
                >
                  <HiOutlineTrash size={btnParams.iconSize} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
