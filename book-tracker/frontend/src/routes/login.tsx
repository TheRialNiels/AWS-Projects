import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { AuthService } from '@/services/auth.service'
import type { Login } from '@/interfaces/auth.types'
import { LoginForm } from '@/components/auth/login-form'
import { useAuth } from '@/lib/auth-context'
import { useErrorToast } from '@/lib/toastify'
import { useState } from 'react'

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
  const [isPending, setIsPending] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleOnSubmit = async (data: Login) => {
    setIsPending(true)
    try {
      await login(data.email, data.password)
      router.navigate({ to: '/' })
    } catch (error: any) {
      useErrorToast(error.message || 'There was an error logging in')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4 sm:mx-8 lg:mx-0">
        <LoginForm onSubmit={handleOnSubmit} isPending={isPending} />
      </div>
    </div>
  )
}
