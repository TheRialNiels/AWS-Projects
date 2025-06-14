import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2Icon } from 'lucide-react'
import { categorySchema } from '@interfaces/categories'
import { useAppForm } from '@/components/ui/tanstack-form'
import { useCallback } from 'react'
import { useCreateCategory } from '@services/mutations/categoriesMutations'

interface CreateCategoryFormProps {
  handleOnSuccess: () => void
}

export function CreateCategoryForm({
  handleOnSuccess,
}: CreateCategoryFormProps) {
  const createCategoryMutation = useCreateCategory()
  const form = useAppForm({
    validators: { onChange: categorySchema },
    defaultValues: {
      label: '',
    },
    onSubmit: ({ value }) =>
      createCategoryMutation.mutate(value, {
        onSuccess: () => {
          handleOnSuccess()
        },
      }),
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
      <form className="space-y-6" onSubmit={handleSubmit}>
        <form.AppField
          name="label"
          children={(field) => (
            <field.FormItem>
              <field.FormLabel>Category Name</field.FormLabel>
              <field.FormControl>
                <Input
                  placeholder="Enter category name"
                  className="main-form-input"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={createCategoryMutation.isPending}
                />
              </field.FormControl>
              <field.FormDescription>
                This is the name of the category.
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />

        {createCategoryMutation.isPending ? (
          <Button size="sm" disabled>
            <Loader2Icon className="animate-spin" />
            Loading...
          </Button>
        ) : (
          <Button type="submit" className="cursor-pointer">
            Submit
          </Button>
        )}
      </form>
    </form.AppForm>
  )
}
