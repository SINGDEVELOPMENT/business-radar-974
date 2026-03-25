import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function ScoreCircle({ score, size = 'default' }: { score: number; size?: 'sm' | 'default' }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const TrendIcon = score >= 60 ? TrendingUp : score >= 40 ? Minus : TrendingDown
  const isSmall = size === 'sm'
  return (
    <div className={`flex flex-col items-center justify-center rounded-full shrink-0 ${isSmall ? 'w-14 h-14 border-[3px]' : 'w-20 h-20 border-4'}`} style={{ borderColor: color }}>
      <span className={`font-bold leading-none ${isSmall ? 'text-sm' : 'text-xl'}`} style={{ color }}>{score}</span>
      <TrendIcon className={isSmall ? 'w-3 h-3 mt-0.5' : 'w-4 h-4'} style={{ color }} />
    </div>
  )
}
