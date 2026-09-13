import { cn } from '@/lib/cn'

type SodaLogoProps = {
  variant?: 'full' | 'header' | 'auth'
  className?: string
}

export function SodaLogo({ variant = 'full', className }: SodaLogoProps) {
  if (variant === 'header') {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <img
          src="/soda-icon-transparent.png"
          alt=""
          aria-hidden
          className="h-9 w-9 shrink-0 object-contain"
        />
        <div className="leading-tight">
          <p className="font-[Space_Grotesk] text-lg font-bold text-white">SODA</p>
          <p className="text-[9px] uppercase tracking-[0.12em] text-[#8b9bb8]">Building the future, together</p>
        </div>
      </div>
    )
  }

  if (variant === 'auth') {
    return (
      <div className={cn('flex flex-col items-center text-center', className)}>
        <img
          src="/soda-icon-transparent.png"
          alt=""
          aria-hidden
          className="mb-5 h-20 w-20 object-contain md:h-24 md:w-24"
        />
        <h1 className="font-[Space_Grotesk] text-4xl font-bold tracking-wide text-white md:text-5xl">
          S<span className="relative mx-0.5 inline-block text-[#4da3ff]">O</span>DA
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#8b9bb8] md:text-xs">
          Building the future, together
        </p>
      </div>
    )
  }

  return (
    <img
      src="/soda-logo.png"
      alt="SODA — Building the future, together."
      className={cn('h-40 w-auto max-w-full object-contain', className)}
    />
  )
}
