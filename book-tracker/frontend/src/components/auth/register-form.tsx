import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/components/ui/tanstack-form'
import { RegisterSchema, type Register } from '@/interfaces/auth.types'
import { Loader2 } from 'lucide-react'
import { useCallback } from 'react'

interface RegisterFormProps {
  onSubmit: (data: Register) => void
  isPending?: boolean
}

export function RegisterForm({
  onSubmit,
  isPending,
  ...props
}: RegisterFormProps) {
  const form = useAppForm({
    validators: {
      onChange: RegisterSchema,
      onSubmit: RegisterSchema.refine(
        (data) => data.password === data.confirmPassword,
        {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        },
      ),
    },
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: ({ value }) => {
      onSubmit(value as Register)
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
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your information below to create your account
          </p>
        </div>
        <div className="grid gap-6">
          <form.AppField
            name="email"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Email</field.FormLabel>
                <field.FormControl>
                  <Input
                    placeholder="email@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isPending}
                  />
                </field.FormControl>
                <field.FormMessage />
              </field.FormItem>
            )}
          />
          <form.AppField
            name="password"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Password</field.FormLabel>
                <field.FormControl>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isPending}
                  />
                </field.FormControl>
                <field.FormMessage />
              </field.FormItem>
            )}
          />
          <form.AppField
            name="confirmPassword"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Confirm Password</field.FormLabel>
                <field.FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isPending}
                  />
                </field.FormControl>
                <field.FormMessage />
              </field.FormItem>
            )}
          />

          {isPending ? (
            <Button size="sm" disabled className="w-full sm:w-auto">
              <Loader2 className="animate-spin" />
              Creating account...
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto">
              Create account
            </Button>
          )}
        </div>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="underline underline-offset-4">
            Login
          </a>
        </div>
      </form>
    </form.AppForm>
  )
}
