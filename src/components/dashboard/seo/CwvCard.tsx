import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type CwvStatus, statusBg, statusBadge, statusColor, statusLabel } from './cwv-utils'

export interface CwvCardProps {
  label: string
  value: string
  status: CwvStatus
  hint: string
}

export default function CwvCard({ label, value, status, hint }: CwvCardProps) {
  return (
    <div className={cn('rounded-xl p-3 flex flex-col gap-1', statusBg(status))}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-600">{label}</span>
        <Badge variant={statusBadge(status)} className="text-[9px] px-1 py-0">{statusLabel(status)}</Badge>
      </div>
      <p className={cn('text-xl font-bold', statusColor(status))}>{value}</p>
      <p className="text-xs text-gray-500">{hint}</p>
    </div>
  )
}
