import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppForm } from '@/components/ui/tanstack-form'
import { Textarea } from '@/components/ui/textarea'
import { statuses } from '@/data/data'
import {
  BookSchema,
  type Book,
  type BookAuthor,
  type BookNotes,
  type BookRating,
  type BookStatus,
  type BookTitle,
} from '@/interfaces/books.types'
import { Loader2 } from 'lucide-react'
import { useCallback } from 'react'

interface BookFormProps {
  onSubmit: (data: Book) => void
  book?: Book
  isPending?: boolean
}

export function BookForm({
  onSubmit,
  book,
  isPending,
  ...props
}: BookFormProps) {
  const form = useAppForm({
    validators: {
      onChange: BookSchema,
    },
    defaultValues: book ?? {
      title: '',
      author: '',
      status: '',
    },
    onSubmit: ({ formApi, value }) => {
      onSubmit(value)
      formApi.reset()
    },
    // onSubmit: ({ value }: { value: Book }) => {
    //   console.log('🚀 ~ BookForm ~ value:', value)
    // },
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      e.stopPropagation()
      await form.handleSubmit()
    },
    [form],
  )
  return (
    <form.AppForm>
      <form className="space-y-6" onSubmit={handleSubmit} {...props}>
        <form.AppField
          name="title"
          children={(field) => (
            <field.FormItem>
              <field.FormLabel>Title</field.FormLabel>
              <field.FormControl>
                <Input
                  placeholder="Enter book title"
                  value={field.state.value as BookTitle}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isPending}
                />
              </field.FormControl>
              <field.FormDescription>
                Enter the title of the book.
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />
        <form.AppField
          name="author"
          children={(field) => (
            <field.FormItem>
              <field.FormLabel>Author</field.FormLabel>
              <field.FormControl>
                <Input
                  placeholder="Enter book author"
                  value={field.state.value as BookAuthor}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isPending}
                />
              </field.FormControl>
              <field.FormDescription>
                Enter the author of the book.
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />
        <div className="flex items-start gap-4 justify-between">
          <form.AppField
            name="status"
            children={(field) => {
              const id = 'book-select'

              return (
                <field.FormItem>
                  <field.FormLabel htmlFor={id}>Status</field.FormLabel>
                  <field.FormControl>
                    <Select
                      value={field.state.value as BookStatus}
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={isPending}
                    >
                      <SelectTrigger id={id} className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </field.FormControl>
                  <field.FormDescription>
                    Select the current status of the book.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )
            }}
          />

          <form.AppField
            name="rating"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Rating</field.FormLabel>
                <field.FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={5}
                    value={field.state.value as BookRating}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    disabled={isPending}
                  />
                </field.FormControl>
                <field.FormDescription className="text-xs">
                  Enter a rating from 0 to 5. Default is 0.
                </field.FormDescription>
                <field.FormMessage className="text-xs" />
              </field.FormItem>
            )}
          />
        </div>

        <form.AppField
          name="notes"
          children={(field) => (
            <field.FormItem>
              <field.FormLabel>Notes</field.FormLabel>
              <field.FormControl>
                <Textarea
                  placeholder="Enter any notes about the book"
                  value={field.state.value as BookNotes}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                />
              </field.FormControl>
              <field.FormDescription>
                Enter any notes or thoughts about the book.
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />

        {isPending ? (
          <Button size="sm" disabled>
            <Loader2 className="animate-spin" />
            Loading...
          </Button>
        ) : (
          <Button type="submit" className="cursor-pointer">
            {book ? 'Update' : 'Submit'}
          </Button>
        )}
      </form>
    </form.AppForm>
  )
}
