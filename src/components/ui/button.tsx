import { cn } from '@/lib/cn'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-60',
        variant === 'primary' && 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-sm',
        variant === 'secondary' && 'border border-[#243049] bg-[#151d32] text-[#c8d2e8] hover:border-violet-500',
        variant === 'ghost' && 'text-[#8b9bb8] hover:bg-[#151d32]',
        variant === 'danger' && 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-5 py-2.5 text-base',
        className,
      )}
      {...props}
    />
  )
}
