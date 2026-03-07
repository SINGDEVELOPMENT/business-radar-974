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
 * Inclut les nouvelles vérifications on-page (inspiré claude-seo).
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
    // Nouvelles colonnes on-page
    title_length?: number | null
    meta_description_length?: number | null
    canonical_url?: string | null
    has_og_tags?: boolean | null
    h2_count?: number | null
    images_without_alt?: number | null
    total_images?: number | null
    has_schema?: boolean | null
    schema_types?: string[] | null
    has_sitemap?: boolean | null
    has_robots_txt?: boolean | null
    word_count?: number | null
  },
): SeoIssue[] {
  const issues: SeoIssue[] = []

  // ── Critique : accessibilité du site ──────────────────────────────────────
  if (!snapshot.has_ssl) {
    issues.push({
      key: 'ssl',
      label: 'Site non sécurisé (HTTP)',
      detail: 'Passez en HTTPS pour protéger vos visiteurs et améliorer votre positionnement Google.',
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

  // ── Performance ────────────────────────────────────────────────────────────
  if (snapshot.load_time_ms != null) {
    if (snapshot.load_time_ms > 5000) {
      issues.push({
        key: 'speed',
        label: `Chargement très lent (${(snapshot.load_time_ms / 1000).toFixed(1)} s)`,
        detail: 'Un temps > 5 s pénalise fortement le SEO. Optimisez vos images, scripts et votre hébergeur.',
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

  // ── Balises essentielles ───────────────────────────────────────────────────
  if (!snapshot.title) {
    issues.push({
      key: 'title',
      label: 'Balise <title> manquante',
      detail: 'Ajoutez un titre unique et descriptif à votre page (50-60 caractères recommandés).',
      priority: 'haute',
    })
  } else if (snapshot.title_length != null) {
    if (snapshot.title_length < 30) {
      issues.push({
        key: 'title_short',
        label: `Titre trop court (${snapshot.title_length} car.)`,
        detail: 'Votre titre est trop court. Visez 50-60 caractères avec votre mot-clé principal.',
        priority: 'moyenne',
      })
    } else if (snapshot.title_length > 60) {
      issues.push({
        key: 'title_long',
        label: `Titre trop long (${snapshot.title_length} car.)`,
        detail: 'Votre titre dépasse 60 caractères — il sera tronqué dans les résultats Google.',
        priority: 'moyenne',
      })
    }
  }

  if (!snapshot.meta_description) {
    issues.push({
      key: 'meta',
      label: 'Meta description absente',
      detail: 'Rédigez une meta description de 150-160 caractères pour améliorer le taux de clic sur Google.',
      priority: 'haute',
    })
  } else if (snapshot.meta_description_length != null) {
    if (snapshot.meta_description_length < 120) {
      issues.push({
        key: 'meta_short',
        label: `Meta description trop courte (${snapshot.meta_description_length} car.)`,
        detail: 'Développez votre meta description pour atteindre 150-160 caractères et maximiser les clics.',
        priority: 'basse',
      })
    } else if (snapshot.meta_description_length > 160) {
      issues.push({
        key: 'meta_long',
        label: `Meta description trop longue (${snapshot.meta_description_length} car.)`,
        detail: 'Au-delà de 160 caractères la description sera coupée dans Google. Raccourcissez-la.',
        priority: 'moyenne',
      })
    }
  }

  // ── Structure H1 ───────────────────────────────────────────────────────────
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

  // ── Canonical URL ──────────────────────────────────────────────────────────
  if (snapshot.canonical_url === null || snapshot.canonical_url === undefined) {
    issues.push({
      key: 'canonical',
      label: 'Balise canonical absente',
      detail: 'Ajoutez une balise <link rel="canonical"> pour éviter le contenu dupliqué.',
      priority: 'moyenne',
    })
  }

  // ── Open Graph ─────────────────────────────────────────────────────────────
  if (snapshot.has_og_tags === false) {
    issues.push({
      key: 'og_tags',
      label: 'Balises Open Graph manquantes',
      detail: 'Ajoutez og:title, og:description et og:image pour optimiser le partage sur les réseaux sociaux.',
      priority: 'moyenne',
    })
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  if (snapshot.images_without_alt != null && snapshot.images_without_alt > 0) {
    issues.push({
      key: 'alt_text',
      label: `${snapshot.images_without_alt} image${snapshot.images_without_alt > 1 ? 's' : ''} sans texte alternatif`,
      detail: 'Ajoutez un attribut alt descriptif à toutes vos images pour le SEO et l\'accessibilité.',
      priority: snapshot.images_without_alt > 3 ? 'haute' : 'moyenne',
    })
  }

  // ── Schema markup ──────────────────────────────────────────────────────────
  if (snapshot.has_schema === false) {
    issues.push({
      key: 'schema',
      label: 'Aucun schema markup (données structurées)',
      detail: 'Ajoutez du JSON-LD (LocalBusiness, Product, Review…) pour obtenir des rich snippets dans Google.',
      priority: 'moyenne',
    })
  }

  // ── Sitemap et robots.txt ──────────────────────────────────────────────────
  if (snapshot.has_sitemap === false) {
    issues.push({
      key: 'sitemap',
      label: 'Sitemap XML introuvable',
      detail: 'Créez un fichier sitemap.xml et soumettez-le à Google Search Console.',
      priority: 'moyenne',
    })
  }

  if (snapshot.has_robots_txt === false) {
    issues.push({
      key: 'robots',
      label: 'Fichier robots.txt absent',
      detail: 'Ajoutez un fichier robots.txt pour guider l\'exploration des moteurs de recherche.',
      priority: 'basse',
    })
  }

  // ── Poids de la page ───────────────────────────────────────────────────────
  if (snapshot.page_size_kb && snapshot.page_size_kb > 2000) {
    issues.push({
      key: 'size',
      label: `Page trop lourde (${snapshot.page_size_kb} KB)`,
      detail: 'Réduisez la taille de vos ressources (images, scripts) pour accélérer le chargement.',
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
