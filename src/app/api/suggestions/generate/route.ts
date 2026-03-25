import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

// ── Tool use schema — structured response from Claude ──────────────────────
const SUGGESTIONS_TOOL: Anthropic.Tool = {
  name: 'submit_suggestions',
  description: 'Soumettre les suggestions de posts réseaux sociaux',
  input_schema: {
    type: 'object',
    properties: {
      suggestions: {
        type: 'array',
        description: '5 suggestions de posts',
        items: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['facebook', 'instagram'],
              description: 'Plateforme cible',
            },
            text: {
              type: 'string',
              description: 'Texte complet du post',
            },
            hashtags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Hashtags sans le # (ajouté automatiquement)',
            },
            best_time: {
              type: 'string',
              description: 'Créneau optimal ex: Mardi 18h-20h',
            },
            reasoning: {
              type: 'string',
              description: 'Justification basée sur les données',
            },
          },
          required: ['platform', 'text', 'hashtags', 'best_time', 'reasoning'],
          additionalProperties: false,
        },
      },
    },
    required: ['suggestions'],
    additionalProperties: false,
  },
}

type SuggestionInput = {
  platform: 'facebook' | 'instagram'
  text: string
  hashtags: string[]
  best_time: string
  reasoning: string
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── 1. Profile + org ───────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 400 })

  const { data: org } = await supabase
    .from('organizations')
    .select('plan, api_key_claude')
    .eq('id', orgId)
    .single()

  // ── 2. Premium gate ────────────────────────────────────────────────────
  if (org?.plan !== 'premium') {
    return NextResponse.json(
      { error: 'Les suggestions de contenu sont réservées au plan Premium.', upgrade: true },
      { status: 403 }
    )
  }

  // ── 3. Business principal ──────────────────────────────────────────────
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('organization_id', orgId)
    .eq('is_competitor', false)
    .limit(1)

  const business = businesses?.[0]
  if (!business) return NextResponse.json({ error: 'Aucun business configuré' }, { status: 400 })

  // ── 4. Collecte des données sociales (50 derniers posts) ───────────────
  const { data: posts } = await supabase
    .from('social_posts')
    .select('platform, content, likes, comments, shares, published_at')
    .eq('business_id', business.id)
    .order('published_at', { ascending: false })
    .limit(50)

  const postList = posts ?? []
  const totalEngagement = postList.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0
  )
  const avgEngagement = postList.length > 0 ? Math.round(totalEngagement / postList.length) : 0

  const bestPost = [...postList].sort((a, b) =>
    (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0) -
    ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0))
  )[0]

  const facebookPosts = postList.filter(p => p.platform === 'facebook')
  const instagramPosts = postList.filter(p => p.platform === 'instagram')

  // ── 5. Données concurrents ─────────────────────────────────────────────
  const { data: competitorRows } = await supabase
    .from('businesses')
    .select('name, google_rating, google_reviews_count')
    .eq('organization_id', orgId)
    .eq('is_competitor', true)
    .not('google_rating', 'is', null)
    .order('google_rating', { ascending: false })
    .limit(5)

  const competitors = (competitorRows ?? []).map(c =>
    `${c.name} (${c.google_rating ?? 'N/A'}★, ${c.google_reviews_count ?? 0} avis)`
  ).join(', ')

  // ── 6. Construction du prompt ──────────────────────────────────────────
  const recentPostsSample = postList
    .slice(0, 10)
    .map(p => `[${p.platform}] "${(p.content ?? '').slice(0, 120)}" — ${(p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0)} interactions`)
    .join('\n')

  const prompt = `Tu es un community manager expert du marché réunionnais (La Réunion).

## Business analysé
Nom : ${business.name}

## Statistiques réseaux sociaux
- Total posts analysés : ${postList.length} (${facebookPosts.length} Facebook, ${instagramPosts.length} Instagram)
- Engagement moyen par post : ${avgEngagement} interactions
${bestPost ? `- Meilleur post : "${(bestPost.content ?? '').slice(0, 150)}" (${(bestPost.likes ?? 0) + (bestPost.comments ?? 0) + (bestPost.shares ?? 0)} interactions)` : ''}

## Derniers posts publiés
${recentPostsSample || 'Aucun post récent disponible'}

## Concurrents actifs
${competitors || 'Aucune donnée concurrents disponible'}

## Instructions
Analyse les données et génère 5 suggestions de posts pour les réseaux sociaux.
Adapte le ton au secteur et au marché réunionnais.
Inclus des références locales (événements, saisons, culture créole, spécificités DOM-TOM).
Pour chaque post : texte complet prêt à publier, plateforme (facebook ou instagram), hashtags pertinents, créneau optimal de publication, et une justification basée sur les données ci-dessus.
Varie les plateformes (minimum 2 Facebook, 2 Instagram).
`

  // ── 7. Appel Claude ────────────────────────────────────────────────────
  try {
    const apiKey = org.api_key_claude ?? process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY non configurée.')

    const anthropic = new Anthropic({ apiKey })

    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      tools: [SUGGESTIONS_TOOL],
      tool_choice: { type: 'tool', name: 'submit_suggestions' },
      messages: [{ role: 'user', content: prompt }],
    })

    const message = await stream.finalMessage()

    const toolUse = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )
    if (!toolUse) throw new Error('Claude n\'a pas retourné de suggestions structurées')

    const { suggestions } = toolUse.input as { suggestions: SuggestionInput[] }

    // ── 8. Sauvegarde en base ──────────────────────────────────────────
    const admin = createAdminClient()
    const rows = suggestions.map(s => ({
      business_id: business.id,
      organization_id: orgId,
      platform: s.platform,
      suggested_text: s.text,
      hashtags: s.hashtags,
      best_time: s.best_time,
      reasoning: s.reasoning,
      status: 'pending',
    }))

    const { data: inserted, error: insertError } = await admin
      .from('content_suggestions')
      .insert(rows)
      .select()

    if (insertError) throw new Error(`Erreur sauvegarde : ${insertError.message}`)

    return NextResponse.json({ suggestions: inserted })
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Limite de l\'API Claude atteinte. Réessayez dans quelques instants.' },
        { status: 429 }
      )
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: 'Clé API Claude invalide. Vérifiez votre configuration dans les paramètres.' },
        { status: 500 }
      )
    }
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
