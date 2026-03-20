import { type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center text-center py-8">
        <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
          <Icon className="w-8 h-8 text-gray-400 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">{title}</h3>
        <p className="text-sm text-gray-400 dark:text-slate-400 max-w-sm">{description}</p>
      </div>
    </Card>
  )
}
