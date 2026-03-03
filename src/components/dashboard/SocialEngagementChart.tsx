'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export interface EngagementPoint {
  date: string
  facebook: number
  instagram: number
}

interface SocialEngagementChartProps {
  data: EngagementPoint[]
}

export default function SocialEngagementChart({ data }: SocialEngagementChartProps) {
  if (data.length < 2) {
    return (
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          Évolution de l&apos;engagement
        </h3>
        <p className="text-sm text-gray-500">
          Le graphique s&apos;affichera après plusieurs collectes.
        </p>
      </Card>
    )
  }

  const hasFb = data.some((d) => d.facebook > 0)
  const hasIg = data.some((d) => d.instagram > 0)

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-400" />
        Évolution de l&apos;engagement
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value) => (value === 'facebook' ? 'Facebook' : 'Instagram')}
          />
          {hasFb && (
            <Line
              type="monotone"
              dataKey="facebook"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 3 }}
              activeDot={{ r: 5 }}
            />
          )}
          {hasIg && (
            <Line
              type="monotone"
              dataKey="instagram"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: '#a855f7', r: 3 }}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
