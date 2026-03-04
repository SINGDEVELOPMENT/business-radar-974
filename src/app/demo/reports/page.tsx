import Header from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function DemoReportsPage() {
  return (
    <div className="space-y-6">
      <Header title="Rapports AI" subtitle="Analyses et recommandations générées par Claude" />

      {/* Gate standard */}
      <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-600 shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Fonctionnalité Premium</h3>
              <Badge className="bg-blue-600">Premium</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
              La génération de rapports AI est réservée aux abonnés Premium. Passez au plan Premium pour accéder à :
            </p>
            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-slate-300">
              <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 1 rapport AI automatique chaque semaine</li>
              <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 5 rapports manuels par mois</li>
              <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Jusqu&apos;à 5 concurrents surveillés (vs 2 en standard)</li>
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/demo-premium/reports"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4" />
                Voir la démo Premium
              </Link>
              <p className="text-xs text-gray-500">Contactez votre administrateur pour passer en Premium.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Aperçu flou du rapport — teaser visuel */}
      <div className="relative">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-xl">
          <Lock className="w-8 h-8 text-blue-400" />
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Disponible en Premium</p>
          <Link href="/demo-premium/reports" className="text-xs text-blue-600 underline hover:no-underline">
            Voir un exemple de rapport →
          </Link>
        </div>
        <div className="pointer-events-none select-none opacity-30 space-y-4 p-1">
          <Card className="p-5">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-bold text-emerald-600">74</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              {[1,2,3].map(i => <div key={i} className="h-2.5 bg-gray-100 rounded w-full" />)}
            </Card>
            <Card className="p-5 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              {[1,2,3].map(i => <div key={i} className="h-2.5 bg-gray-100 rounded w-full" />)}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
