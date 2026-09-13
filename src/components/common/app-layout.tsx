import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { SodaLogo } from '@/components/common/soda-logo'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/', label: 'Analyzer' },
  { to: '/issues', label: 'Issues ' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="soda-grid-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[#243049] bg-[#070b14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <SodaLogo variant="header" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  location.pathname === item.to
                    ? 'bg-violet-600/20 text-violet-200'
                    : 'text-[#8b9bb8] hover:text-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-[#8b9bb8] sm:inline">{user?.name}</span>
            <button type="button" onClick={logout} className="hidden rounded-lg border border-[#243049] px-3 py-1.5 text-sm text-[#c8d2e8] hover:border-violet-500 md:inline-block">
              Logout
            </button>
            <button type="button" className="rounded-lg border border-[#243049] px-2 py-1 text-[#c8d2e8] md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[#243049] px-4 py-3 md:hidden animate-fade-in">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-[#c8d2e8]">{item.label}</Link>
            ))}
            <button type="button" onClick={logout} className="mt-2 text-sm text-red-300">Logout</button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">{children}</main>
    </div>
  )
}
