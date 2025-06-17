import { columns } from '@/components/table/columns'
import { createFileRoute } from '@tanstack/react-router'
import { taskSchema, type Task } from '@/data/schema'
import tasksJson from '@/data/tasks.json' with { type: 'json' }
import { z } from 'zod'
import { BooksTable } from '../components/books/books-table'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function getTasks(): Task[] {
  const tasks: Task[] = tasksJson

  return z.array(taskSchema).parse(tasks)
}

function App() {
  const [tasks, setTasks] = useState<[] | Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTasks(getTasks())
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

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
        data={tasks}
        columns={columns}
        isLoading={loading}
        isError={false}
      />
    </>
  )
}
