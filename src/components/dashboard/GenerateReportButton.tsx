'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Loader2 } from 'lucide-react'

interface GenerateReportButtonProps {
  remaining?: number
}

export default function GenerateReportButton({ remaining = 5 }: GenerateReportButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDisabled = loading || remaining <= 0

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Erreur ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleGenerate} disabled={isDisabled} className="gap-2">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Analyse en cours…</>
        ) : remaining <= 0 ? (
          <><Brain className="w-4 h-4" />Limite atteinte</>
        ) : (
          <><Brain className="w-4 h-4" />Générer un rapport</>
        )}
      </Button>
      {loading && <p className="text-xs text-gray-400">L&apos;analyse Claude peut prendre 30 à 60 secondes.</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
