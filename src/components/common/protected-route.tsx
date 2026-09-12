import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/auth-context'
import { PageLoading } from '@/components/common/page-loading'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />

  return children
}
