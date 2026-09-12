export type AuthUser = {
  id: number
  name: string
  email: string
}

const STORAGE_KEY = 'soda_auth'

export function saveAuth(token: string, user: AuthUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

export function getAuth(): { token: string; user: AuthUser } | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { token: string; user: AuthUser }
  } catch {
    return null
  }
}

export function clearAuth() {
  sessionStorage.removeItem(STORAGE_KEY)
}
