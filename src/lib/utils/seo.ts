import type { SeoSnapshot } from '@/types'

export interface SeoIssue {
  key: string
  label: string
  detail: string
  priority: 'haute' | 'moyenne' | 'basse'
}

/**
 * Calcule un score SEO sur 100 à partir d'un snapshot.
 * Ce score est stocké dans la colonne lighthouse_score.
 *
 * Critères :
 * - SSL actif           : +20 pts
 * - Status HTTP 200     : +20 pts
 * - Load time < 2s      : +20 pts  (< 5s : +10 pts)
 * - Balise title        : +15 pts
 * - Meta description    : +15 pts
 * - H1 = 1 exactement   : +10 pts  (H1 > 0 : +5 pts)
 */
export function computeSeoScore(
  snapshot: {
    has_ssl?: boolean | null
    status_code?: number | null
    load_time_ms?: number | null
    title?: string | null
    meta_description?: string | null
    h1_count?: number | null
  },
): number {
  let score = 0

  if (snapshot.has_ssl) score += 20
  if (snapshot.status_code === 200) score += 20

  if (snapshot.load_time_ms != null) {
    if (snapshot.load_time_ms < 2000) score += 20
    else if (snapshot.load_time_ms < 5000) score += 10
  }

  if (snapshot.title) score += 15
  if (snapshot.meta_description) score += 15

  if (snapshot.h1_count === 1) score += 10
  else if (snapshot.h1_count && snapshot.h1_count > 1) score += 5

  return score
}

/**
 * Retourne la liste des problèmes SEO détectés avec recommandations.
 */
export function computeSeoIssues(
  snapshot: {
    has_ssl?: boolean | null
    status_code?: number | null
    load_time_ms?: number | null
    title?: string | null
    meta_description?: string | null
    h1_count?: number | null
    page_size_kb?: number | null
  },
): SeoIssue[] {
  const issues: SeoIssue[] = []

  if (!snapshot.has_ssl) {
    issues.push({
      key: 'ssl',
      label: 'Site non sécurisé (HTTP)',
      detail:
        'Passez en HTTPS pour protéger vos visiteurs et améliorer votre positionnement Google.',
      priority: 'haute',
    })
  }

  if (snapshot.status_code != null && snapshot.status_code !== 200) {
    issues.push({
      key: 'status',
      label: `Site inaccessible (code HTTP ${snapshot.status_code})`,
      detail: 'Votre site retourne une erreur HTTP. Vérifiez votre hébergement.',
      priority: 'haute',
    })
  }

  if (snapshot.load_time_ms != null) {
    if (snapshot.load_time_ms > 5000) {
      issues.push({
        key: 'speed',
        label: `Chargement très lent (${(snapshot.load_time_ms / 1000).toFixed(1)} s)`,
        detail:
          'Un temps > 5 s pénalise fortement le SEO. Optimisez vos images, scripts et votre hébergeur.',
        priority: 'haute',
      })
    } else if (snapshot.load_time_ms > 2000) {
      issues.push({
        key: 'speed',
        label: `Chargement lent (${(snapshot.load_time_ms / 1000).toFixed(1)} s)`,
        detail: 'Visez un temps de chargement inférieur à 2 s pour un meilleur référencement.',
        priority: 'moyenne',
      })
    }
  }

  if (!snapshot.title) {
    issues.push({
      key: 'title',
      label: 'Balise <title> manquante',
      detail:
        'Ajoutez un titre unique et descriptif à votre page (50-60 caractères recommandés).',
      priority: 'haute',
    })
  }

  if (!snapshot.meta_description) {
    issues.push({
      key: 'meta',
      label: 'Meta description absente',
      detail:
        'Rédigez une meta description de 150-160 caractères pour améliorer le taux de clic sur Google.',
      priority: 'haute',
    })
  }

  if (!snapshot.h1_count || snapshot.h1_count === 0) {
    issues.push({
      key: 'h1_missing',
      label: 'Aucune balise H1 détectée',
      detail: 'Ajoutez une balise H1 avec votre mot-clé principal sur chaque page.',
      priority: 'haute',
    })
  } else if (snapshot.h1_count > 1) {
    issues.push({
      key: 'h1_multiple',
      label: `${snapshot.h1_count} balises H1 détectées`,
      detail: 'Utilisez une seule balise H1 par page pour un meilleur référencement.',
      priority: 'moyenne',
    })
  }

  if (snapshot.page_size_kb && snapshot.page_size_kb > 2000) {
    issues.push({
      key: 'size',
      label: `Page trop lourde (${snapshot.page_size_kb} KB)`,
      detail:
        'Réduisez la taille de vos ressources (images, scripts) pour accélérer le chargement.',
      priority: 'moyenne',
    })
  }

  return issues
}

/** Couleur du score selon la valeur */
export function seoScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-orange-500'
  return 'text-red-500'
}

export function seoScoreLabel(score: number): string {
  if (score >= 80) return 'Bon'
  if (score >= 50) return 'À améliorer'
  return 'Critique'
}
