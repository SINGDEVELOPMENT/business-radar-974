'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateReportButtonProps {
  remaining?: number
}

export default function GenerateReportButton({ remaining = 5 }: GenerateReportButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [details, setDetails] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef(0)

  const isDisabled = loading || remaining <= 0

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setDetails(null)
    setElapsed(0)
    elapsedRef.current = 0

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)

    try {
      const res = await fetch('/api/analyze', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Erreur ${res.status}`)
      }
      setDetails(`Terminé en ${elapsedRef.current}s`)
      toast.success('Rapport généré avec succès')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
      toast.error('Erreur lors de la génération du rapport')
    } finally {
      if (timerRef.current) clearInterval(timerRef.current)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleGenerate} disabled={isDisabled} className="gap-2">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Analyse en cours… {elapsed}s</>
        ) : remaining <= 0 ? (
          <><Brain className="w-4 h-4" />Limite atteinte</>
        ) : (
          <><Brain className="w-4 h-4" />Générer un rapport</>
        )}
      </Button>
      {details && !error && (
        <p className="flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="w-3 h-3" />{details}
        </p>
      )}
      {error && <p className="text-xs text-red-500 max-w-xs text-right">{error}</p>}
    </div>
  )
}
