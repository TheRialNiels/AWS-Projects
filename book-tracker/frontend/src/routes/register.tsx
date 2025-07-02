import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useErrorToast, useSuccessToast } from '@/lib/toastify'

import { AuthService } from '@/services/auth.service'
import type { Register } from '@/interfaces/auth.types'
import { RegisterForm } from '@/components/auth/register-form'
import { useState } from 'react'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const isAuthenticated = await AuthService.isAuthenticated()
    if (isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleOnSubmit = async (data: Register) => {
    setIsPending(true)
    try {
      const result = await AuthService.register(data.email, data.password)

      if (result.isSignUpComplete) {
        useSuccessToast('Account created successfully! You can now sign in.')
        router.navigate({ to: '/login' })
      } else {
        useSuccessToast('Please check your email for verification code.')
        router.navigate({
          to: '/confirm-register',
          search: { email: data.email }
        })
      }
    } catch (error: any) {
      useErrorToast(error.message || 'There was an error creating your account')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4 sm:mx-8 lg:mx-0">
        <RegisterForm onSubmit={handleOnSubmit} isPending={isPending} />
      </div>
    </div>
  )
}
