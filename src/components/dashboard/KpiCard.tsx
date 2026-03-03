interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  icon?: string
}

export default function KpiCard({ title, value, subtitle, trend, trendLabel, icon }: KpiCardProps) {
  const trendColor =
    trend === 'up' ? 'text-emerald-600' :
    trend === 'down' ? 'text-red-500' :
    'text-gray-500'

  const trendArrow =
    trend === 'up' ? '↑' :
    trend === 'down' ? '↓' : '→'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && trendLabel && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendArrow} {trendLabel}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}
