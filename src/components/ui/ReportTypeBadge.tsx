import { Badge } from '@/components/ui/badge'

export default function ReportTypeBadge({ type }: { type: string }) {
  const label = type === 'monthly' ? 'Mensuel' : type === 'weekly' ? 'Hebdomadaire' : 'Alerte'
  const variant = type === 'monthly' ? 'default' as const : type === 'weekly' ? 'secondary' as const : 'destructive' as const
  return <Badge variant={variant}>{label}</Badge>
}
