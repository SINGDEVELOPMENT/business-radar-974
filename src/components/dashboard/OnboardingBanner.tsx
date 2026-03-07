import { Radar, CheckCircle2, Clock } from 'lucide-react'

interface Props {
  hasReviews: boolean
  hasSeo: boolean
  hasSocial: boolean
  hasReport: boolean
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {done
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        : <Clock className="w-4 h-4 text-blue-300 shrink-0" />}
      <span className={`text-sm ${done ? 'text-white' : 'text-blue-200'}`}>{label}</span>
    </div>
  )
}

export default function OnboardingBanner({ hasReviews, hasSeo, hasSocial, hasReport }: Props) {
  const doneCount = [hasReviews, hasSeo, hasSocial, hasReport].filter(Boolean).length
  const totalCount = 4

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg shrink-0">
          <Radar className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg">Bienvenue sur Axora !</p>
          <p className="text-blue-100 text-sm mt-0.5">
            Vos données sont en cours de collecte. Le premier rapport sera disponible sous 24h.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Step done label="Configuration du business" />
            <Step done={hasReviews} label="Premiers avis Google" />
            <Step done={hasSeo} label="Audit SEO" />
            <Step done={hasReport} label="Premier rapport AI" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all"
                style={{ width: `${(doneCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-blue-100 shrink-0">{doneCount}/{totalCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
