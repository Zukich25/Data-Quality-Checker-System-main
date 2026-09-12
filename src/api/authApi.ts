import api from '@/lib/axios'
import type { AuthUser } from '@/lib/auth'

type LoginResponse = {
  success: boolean
  data: {
    token: string
    user: AuthUser
  }
  message?: string
}

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth.php', { email, password })
  if (!data.success) throw new Error('Login failed')
  return data.data
}
