import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useErrorToast, useSuccessToast } from '@/lib/toastify'

import { AuthService } from '@/services/auth.service'
import type { ConfirmRegister } from '@/interfaces/auth.types'
import { ConfirmRegisterForm } from '@/components/auth/confirm-register-form'
import { useState } from 'react'

interface ConfirmRegisterSearch {
  email?: string
}

export const Route = createFileRoute('/confirm-register')({
  validateSearch: (search: Record<string, unknown>): ConfirmRegisterSearch => {
    return {
      email: typeof search.email === 'string' ? search.email : undefined,
    }
  },
  beforeLoad: async () => {
    const isAuthenticated = await AuthService.isAuthenticated()
    if (isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: ConfirmRegisterPage,
})

function ConfirmRegisterPage() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { email } = Route.useSearch()

  const handleOnSubmit = async (data: ConfirmRegister) => {
    setIsPending(true)
    try {
      await AuthService.confirmRegister(data.email, data.confirmationCode)
      useSuccessToast('Account verified successfully! You can now login.')
      router.navigate({ to: '/login' })
    } catch (error: any) {
      useErrorToast(
        error.message || 'There was an error verifying your account',
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4 sm:mx-8 lg:mx-0">
        <ConfirmRegisterForm
          onSubmit={handleOnSubmit}
          isPending={isPending}
          email={email}
        />
      </div>
    </div>
  )
}
