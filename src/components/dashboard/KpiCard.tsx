import { type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TrendData {
  value: number      // ex: +0.3 ou -5
  label: string      // ex: "vs mois dernier"
  positive?: boolean // si omis, calculé automatiquement par le signe
}

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: TrendData
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
}: KpiCardProps) {
  const isPositive = trend ? (trend.positive !== undefined ? trend.positive : trend.value > 0) : false
  const isNeutral = trend ? trend.value === 0 : false

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-600 dark:text-slate-400 truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {trend && (
                <span
                  className={cn(
                    'text-xs font-semibold',
                    isNeutral && 'text-gray-500 dark:text-slate-400',
                    !isNeutral && isPositive && 'text-emerald-600',
                    !isNeutral && !isPositive && 'text-red-500',
                  )}
                >
                  {isNeutral ? '→' : isPositive ? '▲' : '▼'}{' '}
                  {trend.value > 0 ? '+' : ''}{trend.value}{' '}
                  <span className="font-normal text-gray-500 dark:text-slate-400">{trend.label}</span>
                </span>
              )}
              {subtitle && <span className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</span>}
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </Card>
  )
}
