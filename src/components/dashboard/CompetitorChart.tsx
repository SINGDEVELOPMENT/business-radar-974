'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'

export interface CompetitorPoint {
  name: string
  rating: number
  reviews: number
  isClient: boolean
}

interface TooltipProps {
  active?: boolean
  payload?: { payload: CompetitorPoint }[]
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-600">
        Note : <span className="font-medium text-gray-900">{d.rating.toFixed(1)} / 5</span>
      </p>
      <p className="text-gray-600">
        Avis : <span className="font-medium text-gray-900">{d.reviews.toLocaleString('fr-FR')}</span>
      </p>
      {d.isClient && <p className="mt-1 font-medium text-blue-600">Votre établissement</p>}
    </div>
  )
}

export default function CompetitorChart({ data }: { data: CompetitorPoint[] }) {
  if (data.length === 0) return null

  // Classé du meilleur au moins bon
  const sorted = [...data].sort((a, b) => b.rating - a.rating)
  const barHeight = 44
  const chartHeight = Math.max(200, sorted.length * barHeight + 40)

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-gray-400" />
        Comparatif des notes Google
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-600 mr-1 align-middle" />
        Votre établissement &nbsp;
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-300 mr-1 align-middle" />
        Concurrent &nbsp;
        <span className="inline-block w-2 border-t-2 border-dashed border-amber-400 mr-1 align-middle" />
        Seuil 4.0
      </p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis
            type="number"
            domain={[0, 5]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: '#374151' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <ReferenceLine
            x={4}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Bar dataKey="rating" radius={[0, 4, 4, 0]} maxBarSize={28} label={{ position: 'right', fontSize: 11, fill: '#6b7280', formatter: (v: unknown) => typeof v === 'number' ? v.toFixed(1) : String(v ?? '') }}>
            {sorted.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isClient ? '#2563eb' : '#cbd5e1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
