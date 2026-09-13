import { Link } from 'react-router'
import { SodaLogo } from '@/components/common/soda-logo'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="soda-grid-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <SodaLogo variant="auth" />
        </div>
        <div className="glass-panel rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 mb-6 text-sm text-[#8b9bb8]">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ text, linkText, to }: { text: string; linkText: string; to: string }) {
  return (
    <p className="mt-5 text-center text-sm text-[#8b9bb8]">
      {text}{' '}
      <Link to={to} className="font-medium text-violet-300 hover:text-violet-200">{linkText}</Link>
    </p>
  )
}
