import { cn } from '@/lib/cn'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#8b9bb8] focus:border-violet-500',
        className,
      )}
      {...props}
    />
  )
}
