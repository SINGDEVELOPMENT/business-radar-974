import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ScoreCardProps {
  label: string
  score: number | null
  icon: React.ElementType
}

export default function ScoreCard({ label, score, icon: Icon }: ScoreCardProps) {
  const color = score == null ? 'text-gray-300' : score >= 90 ? 'text-emerald-600' : score >= 50 ? 'text-orange-500' : 'text-red-500'
  const variant = score == null ? undefined : score >= 90 ? 'success' as const : score >= 50 ? 'warning' as const : 'destructive' as const
  return (
    <Card className="p-4 flex flex-col items-center gap-1 text-center">
      <Icon className="w-4 h-4 text-gray-400 mb-1" />
      <p className={cn('text-3xl font-extrabold', color)}>{score ?? '--'}</p>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      {variant && score != null && <Badge variant={variant} className="text-[10px] px-1.5 mt-0.5">{score >= 90 ? 'Excellent' : score >= 50 ? 'Moyen' : 'Faible'}</Badge>}
    </Card>
  )
}
