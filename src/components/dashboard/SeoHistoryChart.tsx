'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { useIsDark } from '@/hooks/useIsDark'

interface SeoHistoryPoint { date: string; score: number }

export default function SeoHistoryChart({ data }: { data: SeoHistoryPoint[] }) {
  const isDark = useIsDark()
  const gridColor = isDark ? '#1e293b' : '#f0f0f0'
  const axisColor = isDark ? '#64748b' : '#9ca3af'

  if (data.length < 2) {
    return (
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          Historique du score SEO
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          L&apos;historique s&apos;affichera après plusieurs collectes.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        Historique du score SEO
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#111827',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value ?? '--'}/100`, 'Score SEO']}
          />
          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2}
            dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
