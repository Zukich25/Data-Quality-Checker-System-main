import { cn } from '@/lib/cn'

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function Section({ title, description, action, className, children, ...props }: SectionProps) {
  return (
    <section className={cn('animate-fade-in-up', className)} {...props}>
      {(title || description || action) && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="font-[Space_Grotesk] text-lg font-semibold text-slate-800">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
