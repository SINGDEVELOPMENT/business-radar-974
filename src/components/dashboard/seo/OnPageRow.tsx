import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OnPageRowProps {
  label: string
  value: string
  status: 'good' | 'warn' | 'bad' | 'neutral'
  mono?: boolean
}

export default function OnPageRow({ label, value, status, mono = false }: OnPageRowProps) {
  const icon = status === 'good'
    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
    : status === 'bad'
    ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
    : status === 'warn'
    ? <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
    : <span className="w-3.5 h-3.5 shrink-0 mt-0.5" />

  return (
    <div className="flex items-start gap-2 text-sm">
      {icon}
      <span className="text-gray-600 shrink-0 min-w-[120px]">{label}</span>
      <span className={cn(
        'text-right flex-1 min-w-0 truncate',
        mono && 'font-mono text-xs',
        status === 'bad' && 'text-red-500',
        status === 'warn' && 'text-orange-500',
        status === 'good' && 'text-gray-900 dark:text-white',
        status === 'neutral' && 'text-gray-600 dark:text-gray-300',
      )}>
        {value}
      </span>
    </div>
  )
}
