import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/login-form'
import { AuthService } from '@/services/auth.service'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const isAuthenticated = await AuthService.isAuthenticated()
    if (isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  )
}
