import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  variant?: 'default' | 'income' | 'expense' | 'primary'
  className?: string
}

const VARIANT_STYLES = {
  default: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    accent: '',
  },
  income: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accent: 'border-l-4 border-emerald-400',
  },
  expense: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    accent: 'border-l-4 border-red-400',
  },
  primary: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    accent: 'border-l-4 border-indigo-400',
  },
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: DashboardCardProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <div className={cn('card p-5 transition-shadow hover:shadow-md', styles.accent, className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              )}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
