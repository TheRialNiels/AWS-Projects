import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/components/ui/tanstack-form'
import { LoginSchema, type Login } from '@/interfaces/auth.types'
import { Loader2 } from 'lucide-react'
import { useCallback } from 'react'

interface LoginFormProps {
  onSubmit: (data: Login) => void
  isPending?: boolean
}
export function LoginForm({ onSubmit, isPending, ...props }: LoginFormProps) {
  const form = useAppForm({
    validators: {
      onChange: LoginSchema,
    },
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: ({ value }) => {
      onSubmit(value as Login)
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
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
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
              Loading...
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto">
              Login
            </Button>
          )}
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="#" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </form>
    </form.AppForm>
  )
}
