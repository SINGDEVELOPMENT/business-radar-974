import { type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
}: KpiCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {(subtitle || (trend && trendLabel)) && (
            <div className="mt-1 flex items-center gap-2">
              {trend && trendLabel && (
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trend === 'up' && 'text-emerald-600',
                    trend === 'down' && 'text-red-500',
                    trend === 'neutral' && 'text-gray-400',
                  )}
                >
                  {trend === 'up' ? '+' : trend === 'down' ? '' : ''}{trendLabel}
                </span>
              )}
              {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
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
