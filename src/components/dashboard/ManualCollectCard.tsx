'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { RefreshCw, Loader2 } from 'lucide-react'

interface Props {
  lastSeoDate: string | null
  lastReportDate: string | null
  nextAllowedAt: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function useCountdown(nextAllowedAt: string | null) {
  const [remaining, setRemaining] = useState<string | null>(null)

  useEffect(() => {
    if (!nextAllowedAt) return

    function calc() {
      const diff = new Date(nextAllowedAt!).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining(null)
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setRemaining(`${h}h ${m.toString().padStart(2, '0')}min`)
    }

    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [nextAllowedAt])

  return remaining
}

export default function ManualCollectCard({ lastSeoDate, lastReportDate, nextAllowedAt: initialNextAllowed }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextAllowedAt, setNextAllowedAt] = useState<string | null>(initialNextAllowed)

  const countdown = useCountdown(nextAllowedAt)
  const isBlocked = countdown !== null

  async function handleCollect() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/collect/manual', { method: 'POST' })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (res.status === 429 && json.nextAllowedAt) {
        setNextAllowedAt(json.nextAllowedAt)
      }
      setError(json.error ?? 'Erreur lors de la collecte')
    } else {
      setSuccess(true)
      setNextAllowedAt(json.nextAllowedAt)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Collecte des données</h3>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Dernier audit SEO</span>
          <span className="text-gray-700 dark:text-slate-300">{formatDate(lastSeoDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Dernier rapport AI</span>
          <span className="text-gray-700 dark:text-slate-300">{formatDate(lastReportDate)}</span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-600 mb-3">Collecte lancée avec succès !</p>
      )}

      <button
        onClick={handleCollect}
        disabled={loading || isBlocked}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {loading
          ? 'Collecte en cours…'
          : isBlocked
          ? `Disponible dans ${countdown}`
          : 'Lancer une collecte maintenant'}
      </button>
    </Card>
  )
}
