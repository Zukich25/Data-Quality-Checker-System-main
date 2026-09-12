import { cn } from '@/lib/cn'

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'critical' | 'warning' | 'info' | 'success'
}

export function Tag({ className, tone = 'default', ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
        tone === 'default' && 'bg-teal-50 text-teal-700',
        tone === 'critical' && 'bg-red-50 text-red-700',
        tone === 'warning' && 'bg-amber-50 text-amber-700',
        tone === 'info' && 'bg-blue-50 text-blue-700',
        tone === 'success' && 'bg-emerald-50 text-emerald-700',
        className,
      )}
      {...props}
    />
  )
}
