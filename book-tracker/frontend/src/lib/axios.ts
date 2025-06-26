import { AuthService } from '@/services/auth.service'
import axios from 'axios'
import { env } from '@/env'

export const api = axios.create({
  baseURL: env.VITE_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const token = await AuthService.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
