import axios from 'axios'
import { env } from '@/env'

export const api = axios.create({
  baseURL: env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })
