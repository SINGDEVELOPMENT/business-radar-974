'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Facebook, Instagram, Clock, Brain, Copy, Check, Sparkles, Lightbulb } from 'lucide-react'
import { DEMO_SUGGESTIONS } from '@/lib/demo-data'

function PlatformIcon({ platform }: { platform: 'facebook' | 'instagram' }) {
  if (platform === 'facebook') return <Facebook className="w-4 h-4 text-blue-500" />
  return <Instagram className="w-4 h-4 text-pink-500" />
}

function PlatformBadge({ platform }: { platform: 'facebook' | 'instagram' }) {
  if (platform === 'facebook') {
    return (
      <Badge className="gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-50">
        <Facebook className="w-3 h-3" />
        Facebook
      </Badge>
    )
  }
  return (
    <Badge className="gap-1 bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800 hover:bg-pink-50">
      <Instagram className="w-3 h-3" />
      Instagram
    </Badge>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'used' | 'dismissed' }) {
  if (status === 'pending') {
    return <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">En attente</Badge>
  }
  if (status === 'used') {
    return <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700">Publié</Badge>
  }
  return <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-300 dark:border-slate-700">Ignoré</Badge>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          Copié !
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copier
        </>
      )}
    </button>
  )
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 24) return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  return `Il y a ${d}j`
}

export default function DemoPremiumSuggestionsPage() {
  const pendingCount = DEMO_SUGGESTIONS.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Suggestions de contenu</h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Idées de posts générées par l&apos;IA pour booster votre engagement</p>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-50">
            <Sparkles className="w-3 h-3" />
            {pendingCount} suggestion{pendingCount !== 1 ? 's' : ''} en attente
          </Badge>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg opacity-60 cursor-not-allowed"
          title="Fonctionnalité disponible sur votre dashboard"
        >
          <Brain className="w-4 h-4" />
          Générer de nouvelles suggestions
        </button>
      </div>

      {/* Suggestion cards */}
      <div className="space-y-4">
        {DEMO_SUGGESTIONS.map(suggestion => (
          <Card
            key={suggestion.id}
            className={`p-5 transition-opacity ${suggestion.status === 'dismissed' ? 'opacity-60' : ''}`}
          >
            <div className="space-y-3">
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap">
                <PlatformBadge platform={suggestion.platform} />
                <StatusBadge status={suggestion.status} />
                <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relativeTime(suggestion.generated_at)}
                </span>
              </div>

              {/* Post text */}
              <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed bg-gray-50 dark:bg-slate-800/50 rounded-lg px-4 py-3 border border-gray-100 dark:border-slate-700">
                {suggestion.suggested_text}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5">
                {suggestion.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Best time + reasoning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-0.5">Meilleur moment</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">{suggestion.best_time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-3 py-2">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-0.5">Pourquoi ce post</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">{suggestion.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {suggestion.status === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <CopyButton text={suggestion.suggested_text} />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
