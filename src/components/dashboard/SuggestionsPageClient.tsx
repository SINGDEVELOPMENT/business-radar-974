'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/dashboard/EmptyState'
import {
  Sparkles, Copy, Check, Clock, Lightbulb, Loader2,
  Facebook, Instagram, RefreshCw, ThumbsUp, X,
} from 'lucide-react'
import type { ContentSuggestion } from '@/types'

// ── Skeleton ───────────────────────────────────────────────────────────────

function SuggestionSkeleton() {
  return (
    <Card className="p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
    </Card>
  )
}

// ── Platform badge ─────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: 'facebook' | 'instagram' }) {
  if (platform === 'facebook') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        <Facebook className="w-3 h-3" />
        Facebook
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 dark:from-pink-950 dark:to-purple-950 dark:text-pink-300">
      <Instagram className="w-3 h-3" />
      Instagram
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContentSuggestion['status'] }) {
  if (status === 'used') {
    return <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">Utilisé</Badge>
  }
  if (status === 'dismissed') {
    return <Badge variant="secondary" className="text-xs text-gray-400 dark:text-slate-500">Ignoré</Badge>
  }
  return null
}

// ── Single suggestion card ─────────────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: ContentSuggestion
  onStatusChange: (id: string, status: 'used' | 'dismissed') => void
}

function SuggestionCard({ suggestion, onStatusChange }: SuggestionCardProps) {
  const [copied, setCopied] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleCopy = async () => {
    const fullText = suggestion.suggested_text + '\n\n' +
      suggestion.hashtags.map(h => `#${h}`).join(' ')
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      toast.success('Texte copié dans le presse-papiers')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le texte')
    }
  }

  const handleStatus = async (status: 'used' | 'dismissed') => {
    if (updating) return
    setUpdating(true)
    try {
      const res = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestion.id, status }),
      })
      if (!res.ok) throw new Error()
      onStatusChange(suggestion.id, status)
      toast.success(status === 'used' ? 'Marqué comme utilisé' : 'Suggestion ignorée')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const isDone = suggestion.status === 'used' || suggestion.status === 'dismissed'

  return (
    <Card className={`p-5 transition-opacity ${isDone ? 'opacity-60' : ''}`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={suggestion.platform} />
          {suggestion.best_time && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              {suggestion.best_time}
            </span>
          )}
          <StatusBadge status={suggestion.status} />
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Copier le texte du post"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-green-500" />Copié</>
            : <><Copy className="w-3.5 h-3.5" />Copier</>
          }
        </button>
      </div>

      {/* Post text */}
      <p className="text-base text-gray-800 dark:text-slate-200 leading-relaxed mb-3 whitespace-pre-wrap">
        {suggestion.suggested_text}
      </p>

      {/* Hashtags */}
      {suggestion.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestion.hashtags.map((tag, i) => (
            <span
              key={i}
              className="text-xs font-medium text-brand-light dark:text-brand-light bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reasoning */}
      {suggestion.reasoning && (
        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-start gap-1.5 mb-4">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
          {suggestion.reasoning}
        </p>
      )}

      {/* Action buttons (only for pending) */}
      {suggestion.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={() => handleStatus('used')}
            disabled={updating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900 transition-colors disabled:opacity-50"
          >
            {updating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ThumbsUp className="w-3.5 h-3.5" />
            }
            Utilisé
          </button>
          <button
            onClick={() => handleStatus('dismissed')}
            disabled={updating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Ignorer
          </button>
        </div>
      )}
    </Card>
  )
}

// ── Main page client ────────────────────────────────────────────────────────

export default function SuggestionsPageClient() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suggestions', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setSuggestions(json.suggestions ?? [])
    } catch {
      toast.error('Impossible de charger les suggestions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const handleGenerate = async () => {
    setGenerating(true)
    toast.loading('Génération des suggestions en cours...', { id: 'generating' })
    try {
      const res = await fetch('/api/suggestions/generate', { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        toast.dismiss('generating')
        if (json.upgrade) {
          toast.error('Fonctionnalité réservée au plan Premium')
        } else {
          toast.error(json.error ?? 'Erreur lors de la génération')
        }
        return
      }

      toast.dismiss('generating')
      toast.success(`${json.suggestions?.length ?? 0} suggestions générées`)
      await fetchSuggestions()
    } catch {
      toast.dismiss('generating')
      toast.error('Erreur inattendue lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusChange = (id: string, status: 'used' | 'dismissed') => {
    setSuggestions(prev =>
      prev.map(s => s.id === id ? { ...s, status } : s)
    )
  }

  const pendingCount = suggestions.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {!loading && suggestions.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {pendingCount} suggestion{pendingCount !== 1 ? 's' : ''} en attente
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!loading && suggestions.length > 0 && (
            <button
              onClick={fetchSuggestions}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              aria-label="Rafraîchir les suggestions"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" />Génération...</>
              : <><Sparkles className="w-4 h-4" />Générer de nouvelles suggestions</>
            }
          </button>
        </div>
      </div>

      {/* Loading skeletons */}
      {(loading || generating) && (
        <div className="space-y-4">
          {Array.from({ length: generating ? 5 : 3 }).map((_, i) => (
            <SuggestionSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !generating && suggestions.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Aucune suggestion générée"
          description="Cliquez sur « Générer de nouvelles suggestions » pour obtenir des idées de posts personnalisées pour votre business."
        />
      )}

      {/* Suggestions list */}
      {!loading && !generating && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
