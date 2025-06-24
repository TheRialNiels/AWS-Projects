import { fetchAuthSession, getCurrentUser, signIn, signOut } from '@aws-amplify/auth'

export interface AuthUser {
  username: string
  email?: string
}

export class AuthService {
  static async login(username: string, password: string): Promise<void> {
    await signIn({ username, password })
  }

  static async logout(): Promise<void> {
    await signOut()
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser()
      return {
        username: user.username,
        email: user.signInDetails?.loginId
      }
    } catch {
      return null
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() || null
    } catch {
      return null
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser()
      return true
    } catch {
      return false
    }
  }
}
