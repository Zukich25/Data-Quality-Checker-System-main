import { createContext, useContext, useMemo, useState } from 'react'
import { clearAuth, getAuth, saveAuth, type AuthUser } from '@/lib/auth'
import { login as loginRequest, register as registerRequest } from '@/api/authApi'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getAuth()?.user ?? null)
  const [loading] = useState(false)

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const data = await loginRequest(email, password)
      saveAuth(data.token, data.user)
      setUser(data.user)
    },
    async register(name, email, password) {
      const data = await registerRequest(name, email, password)
      saveAuth(data.token, data.user)
      setUser(data.user)
    },
    logout() {
      clearAuth()
      setUser(null)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
