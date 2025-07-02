import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from '@aws-amplify/auth'

export interface AuthUser {
  username: string
  email?: string
}

export class AuthService {
  static async login(username: string, password: string): Promise<void> {
    const result = await signIn({ username, password })

    if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
      const confirmationError = new Error('User account not confirmed')
      confirmationError.name = 'UserNotConfirmedException'
      ;(confirmationError as any).username = username
      throw confirmationError
    }
  }

  static async register(
    email: string,
    password: string,
  ): Promise<{ isSignUpComplete: boolean; nextStep: any }> {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    })
    return result
  }

  static async confirmRegister(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await confirmSignUp({
      username: email,
      confirmationCode,
    })
  }

  static async logout(): Promise<void> {
    await signOut()
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser()
      return {
        username: user.username,
        email: user.signInDetails?.loginId,
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
