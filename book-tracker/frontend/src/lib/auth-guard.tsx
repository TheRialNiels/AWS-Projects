import { redirect } from '@tanstack/react-router'
import { AuthService } from '@/services/auth.service'

export async function requireAuth() {
  const isAuthenticated = await AuthService.isAuthenticated()
  if (!isAuthenticated) {
    throw redirect({ to: '/login' })
  }
}