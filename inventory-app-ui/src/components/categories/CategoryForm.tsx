import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2Icon } from 'lucide-react'
import { categorySchema, type Category } from '@interfaces/categories'
import { useAppForm } from '@/components/ui/tanstack-form'
import { useCallback } from 'react'
import {
  useCreateCategory,
  useUpdateCategory,
} from '@services/mutations/categoriesMutations'

interface CategoryFormProps {
  handleOnSuccess: () => void
  handleOnError: () => void
  category?: Category
}

export function CategoryForm({
  handleOnSuccess,
  handleOnError,
  category,
}: CategoryFormProps) {
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()

  const form = useAppForm({
    validators: { onChange: categorySchema },
    defaultValues: {
      label: category?.label ?? '',
    },
    onSubmit: ({ value }) => {
      console.log('🚀 ~ CategoryForm ~ value:', value)
      console.log('🚀 ~ CategoryForm ~ category:', category)
      const payload = {
        ...value,
        id: category?.id ?? undefined,
      }

      category
        ? updateCategoryMutation.mutate(payload, {
            onSuccess: handleOnSuccess,
            onError: handleOnError,
          })
        : createCategoryMutation.mutate(value, {
            onSuccess: handleOnSuccess,
            onError: handleOnError,
          })
    },
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
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                />
              </field.FormControl>
              <field.FormDescription>
                This is the name of the category.
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />

        {createCategoryMutation.isPending ||
        updateCategoryMutation.isPending ? (
          <Button size="sm" disabled>
            <Loader2Icon className="animate-spin" />
            Loading...
          </Button>
        ) : (
          <Button type="submit" className="cursor-pointer">
            {category ? 'Update' : 'Submit'}
          </Button>
        )}
      </form>
    </form.AppForm>
  )
}
