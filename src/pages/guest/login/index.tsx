import { useState } from 'react'
import { Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin@soda.com')
  const [password, setPassword] = useState('soda123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch {
      setError('Invalid email or password. Make sure Docker is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 font-[Space_Grotesk] text-2xl font-bold text-white shadow-lg">
            S
          </div>
          <h1 className="font-[Space_Grotesk] text-3xl font-bold text-slate-800">SODA</h1>
          <p className="mt-1 text-sm text-slate-500">Data Quality Checker System</p>
        </div>

        <Card>
          <CardBody>
            <h2 className="mb-1 font-semibold text-slate-800">Sign in to your workspace</h2>
            <p className="mb-5 text-xs text-slate-400">Demo: admin@soda.com / soda123</p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
