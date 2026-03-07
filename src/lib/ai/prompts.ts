import { BusinessData } from '@/types'

export function monthlyAnalysisPrompt(data: BusinessData): string {
  return `Tu es un consultant business expert du marché réunionnais (La Réunion, DOM-TOM).
Analyse les données suivantes pour l'entreprise "${data.businessName}" et fournis un rapport structuré.

## Données collectées ce mois :

### Avis Google
- Note moyenne : ${data.avgRating}/5 (${data.totalReviews} avis au total)
- Évolution : ${data.ratingTrend}
- Derniers avis négatifs : ${JSON.stringify(data.negativeReviews.slice(0, 3))}

### Réseaux Sociaux
- Posts ce mois : ${data.postsCount}
- Engagement moyen : ${data.avgEngagement}%
- Meilleur post : ${data.bestPost}

### Concurrents
${data.competitors.map((c) => `- ${c.name}: ${c.rating}/5 (${c.reviews} avis)`).join('\n')}

### SEO
- Score performance : ${data.seoScore}/100
- Problèmes détectés : ${data.seoIssues.join(', ') || 'aucun'}
- Données structurées (schema) : ${data.seoDetails?.hasSchema ? `Oui (${data.seoDetails.schemaTypes?.join(', ') || 'type inconnu'})` : 'Non — opportunité rich snippets'}
- Balises Open Graph : ${data.seoDetails?.hasOgTags ? 'Présentes' : 'Absentes — impact réseaux sociaux'}
- Canonical URL : ${data.seoDetails?.canonicalUrl ? 'Définie' : 'Absente'}
- Sitemap XML : ${data.seoDetails?.hasSitemap === true ? 'Présent' : data.seoDetails?.hasSitemap === false ? 'Absent' : 'Non vérifié'}
- Structure titres : H1=${data.seoDetails?.h1Count ?? '?'}, H2=${data.seoDetails?.h2Count ?? '?'}, H3=${data.seoDetails?.h3Count ?? '?'}
- Images sans alt : ${data.seoDetails?.imagesWithoutAlt ?? 0} / ${data.seoDetails?.totalImages ?? 0}
- Nombre de mots : ${data.seoDetails?.wordCount ?? 'non mesuré'}
- Liens internes : ${data.seoDetails?.internalLinksCount ?? '?'} | Liens externes : ${data.seoDetails?.externalLinksCount ?? '?'}

## Consignes :
1. Résume la situation en 3 phrases max
2. Identifie les 3 points forts
3. Identifie les 3 axes d'amélioration prioritaires
4. Donne 5 recommandations concrètes et actionnables adaptées au contexte réunionnais
5. Compare avec les concurrents locaux
6. Utilise un ton professionnel mais accessible

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "summary": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "recommendations": [
    { "priority": "haute", "action": "...", "impact": "..." }
  ],
  "competitor_analysis": "...",
  "score_global": 0
}`
}

export function alertPrompt(businessName: string, issue: string): string {
  return `Tu es un consultant business expert du marché réunionnais.
L'entreprise "${businessName}" a une alerte critique : ${issue}.
Donne 3 recommandations immédiates en JSON :
{
  "alert": "...",
  "recommendations": [
    { "priority": "haute", "action": "...", "impact": "..." }
  ]
}`
}
