import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useAppForm } from '@/components/ui/tanstack-form'
import { useCallback } from 'react'
import { z } from 'zod/v4'

interface BookFileFormProps {
  onSubmit: (data: { file: File }) => void
  isPending?: boolean
  isImporting?: boolean
  importStatus?: any
}

const FileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'File is required' })
    .refine((file) => file.type === 'text/csv', {
      message: 'File must be a CSV',
    }),
})

export function BookFileForm({ onSubmit, isPending, isImporting, importStatus, ...props }: BookFileFormProps) {
  const form = useAppForm({
    validators: {
      onChange: FileUploadSchema,
    },
    defaultValues: {
      file: null as unknown as File,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
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
          name="file"
          children={(field) => (
            <field.FormItem>
              <field.FormLabel>
                File<span className="text-primary">*</span>
              </field.FormLabel>
              <field.FormControl>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    field.handleChange(e.target.files?.[0] ?? new File([], ''))
                  }
                  onBlur={field.handleBlur}
                  disabled={isPending}
                />
              </field.FormControl>
              <field.FormDescription>
                Upload the csv file.
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />

        {isImporting && importStatus && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Import Status: {importStatus.stage}
            </div>
            {importStatus.totalRows > 0 && (
              <div className="text-sm">
                Progress: {importStatus.processedRows}/{importStatus.totalRows} rows
              </div>
            )}
            {importStatus.errorCount > 0 && (
              <div className="text-sm text-destructive">
                Errors: {importStatus.errorCount}
              </div>
            )}
          </div>
        )}

        {isPending || isImporting ? (
          <Button size="sm" disabled className="w-full sm:w-auto">
            <Loader2 className="animate-spin" />
            {isImporting ? 'Importing...' : 'Uploading...'}
          </Button>
        ) : (
          <Button type="submit" className="w-full sm:w-auto">
            Submit
          </Button>
        )}
      </form>
    </form.AppForm>
  )
}
