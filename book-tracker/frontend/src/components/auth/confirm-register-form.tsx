import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/components/ui/tanstack-form'
import {
  ConfirmRegisterSchema,
  type ConfirmRegister,
} from '@/interfaces/auth.types'
import { Loader2 } from 'lucide-react'
import { useCallback } from 'react'

interface ConfirmRegisterFormProps {
  onSubmit: (data: ConfirmRegister) => void
  isPending?: boolean
  email?: string
}

export function ConfirmRegisterForm({
  onSubmit,
  isPending,
  email,
  ...props
}: ConfirmRegisterFormProps) {
  const form = useAppForm({
    validators: {
      onChange: ConfirmRegisterSchema,
    },
    defaultValues: {
      email: email || '',
      confirmationCode: '',
    },
    onSubmit: ({ value }) => {
      onSubmit(value as ConfirmRegister)
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Confirm your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the verification code sent to your email
          </p>
        </div>
        <div className="grid gap-6">
          <form.AppField
            name="confirmationCode"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Confirmation Code</field.FormLabel>
                <field.FormControl>
                  <Input
                    placeholder="123456"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isPending}
                    maxLength={6}
                  />
                </field.FormControl>
                <field.FormDescription>
                  Enter the 6-digit code sent to your email
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          />

          {isPending ? (
            <Button size="sm" disabled className="w-full sm:w-auto">
              <Loader2 className="animate-spin" />
              Verifying...
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto">
              Verify account
            </Button>
          )}
        </div>

        <div className="text-center text-sm">
          Already confirmed?{' '}
          <a href="/login" className="underline underline-offset-4">
            Log in
          </a>
        </div>
      </form>
    </form.AppForm>
  )
}
