'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-gray-500 dark:text-slate-400 text-center mb-6 max-w-md">
        Un problème inattendu s&apos;est produit. Rechargez la page ou réessayez.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white font-semibold transition-colors text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Réessayer
      </button>
    </div>
  )
}
