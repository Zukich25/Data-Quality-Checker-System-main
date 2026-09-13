import { useState } from 'react'
import { Navigate } from 'react-router'
import { AuthFooterLink, AuthShell } from '@/components/common/auth-shell'
import { useAuth } from '@/contexts/auth-context'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(name, email, password)
    } catch {
      setError('Could not create account. Email may already exist or Docker is offline.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Join SODA and start checking data quality">
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-[#c8d2e8]">Full name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-[#c8d2e8]">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-[#c8d2e8]">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <AuthFooterLink text="Already have an account?" linkText="Login" to="/login" />
    </AuthShell>
  )
}
