import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mb-5 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action}
    </div>
  )
}
