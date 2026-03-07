'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

function useIsDark() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains('dark'))
    const obs = new MutationObserver(() => setIsDark(root.classList.contains('dark')))
    obs.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return isDark
}

interface ChartDataPoint {
  month: string
  avgRating: number
  count: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const d: ChartDataPoint = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 dark:text-slate-200 mb-1">{label}</p>
      <p className="text-amber-600 font-bold">★ {d.avgRating.toFixed(1)} / 5</p>
      <p className="text-gray-600 dark:text-slate-400">{d.count} avis</p>
    </div>
  )
}

export default function ReviewsChart({ data }: { data: ChartDataPoint[] }) {
  const isDark = useIsDark()
  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const axisColor = isDark ? '#64748b' : '#94a3b8'
  const refLineColor = isDark ? '#334155' : '#d1d5db'

  if (data.length === 0) {
    return (
      <Card className="p-6 flex items-center justify-center h-48 text-gray-500 dark:text-slate-400 text-base">
        Aucune donnée temporelle disponible
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
          <TrendingUp className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 dark:text-slate-100">Évolution de la note moyenne</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Note mensuelle moyenne sur la période</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={4} stroke={refLineColor} strokeDasharray="4 4" />
          <Area
            type="monotone" dataKey="avgRating"
            stroke="#f59e0b" strokeWidth={2.5}
            fill="url(#ratingGradient)"
            dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#d97706', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
