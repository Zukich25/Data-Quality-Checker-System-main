import { cn } from '@/lib/cn'

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-[#c8d2e8]', className)}
      {...props}
    />
  )
}
