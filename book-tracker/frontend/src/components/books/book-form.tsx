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
import { BookSchema, type Book } from '@/interfaces/books.types'
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
      status: 'WISHLIST',
      rating: 0,
      notes: '',
    },
    onSubmit: ({ value }) => {
      onSubmit(value as Book)
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
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
                  value={field.state.value}
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
                  value={field.state.value}
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
        <div className="flex flex-col sm:flex-row items-start gap-4 justify-between">
          <form.AppField
            name="status"
            children={(field) => {
              const id = 'book-select'

              return (
                <field.FormItem className="w-full flex-1">
                  <field.FormLabel htmlFor={id}>Status</field.FormLabel>
                  <field.FormControl>
                    <Select
                      value={field.state.value}
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
              <field.FormItem className="w-full sm:w-auto">
                <field.FormLabel>Rating</field.FormLabel>
                <field.FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={5}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    disabled={isPending}
                  />
                </field.FormControl>
                <field.FormDescription className="text-xs">
                  Enter a rating from 0 to 5.
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
                  className="max-h-36"
                  rows={4}
                  placeholder="Enter any notes about the book"
                  value={field.state.value}
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
          <Button size="sm" disabled className="w-full sm:w-auto">
            <Loader2 className="animate-spin" />
            Loading...
          </Button>
        ) : (
          <Button type="submit" className="w-full sm:w-auto">
            {book ? 'Update' : 'Submit'}
          </Button>
        )}
      </form>
    </form.AppForm>
  )
}
