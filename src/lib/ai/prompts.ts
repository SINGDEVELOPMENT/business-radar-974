import { BusinessData } from '@/types'

export function monthlyAnalysisPrompt(data: BusinessData): string {
  return `Tu es un consultant business expert du marché réunionnais (La Réunion, DOM-TOM, Océan Indien).
Analyse les données suivantes pour l'entreprise "${data.businessName}" et fournis un rapport mensuel structuré.

## Données collectées ce mois :

### Avis Google
- Note moyenne : ${data.avgRating}/5 (${data.totalReviews} avis au total)
- Évolution : ${data.ratingTrend}
- Derniers avis négatifs : ${JSON.stringify(data.negativeReviews.slice(0, 3))}

### Réseaux Sociaux
- Posts ce mois : ${data.postsCount}
- Engagement moyen : ${data.avgEngagement}%
- Meilleur post : ${data.bestPost}

### Concurrents locaux
${data.competitors.length > 0
  ? data.competitors.map((c) => `- ${c.name}: ${c.rating}/5 (${c.reviews} avis)`).join('\n')
  : '- Aucun concurrent enregistré'}

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
1. Résume la situation en 3 phrases max, en tenant compte du contexte insulaire réunionnais
2. Identifie les 3-4 points forts les plus significatifs
3. Identifie les 2-3 axes d'amélioration les plus prioritaires
4. Donne 5 recommandations concrètes et actionnables, adaptées au marché local (La Réunion)
5. Compare avec les concurrents locaux si disponibles
6. Calcule un score global honnête entre 0 et 100
7. Utilise un ton professionnel mais accessible pour un entrepreneur réunionnais`
}

export function weeklyAnalysisPrompt(data: BusinessData): string {
  return `Tu es un consultant business expert du marché réunionnais (La Réunion, DOM-TOM).
Analyse les données de la semaine écoulée pour "${data.businessName}" et fournis un point hebdomadaire.

## Données de la semaine :

### Avis Google
- Note moyenne actuelle : ${data.avgRating}/5 (${data.totalReviews} avis au total)
- Évolution récente : ${data.ratingTrend}
- Nouveaux avis négatifs : ${JSON.stringify(data.negativeReviews.slice(0, 2))}

### Activité Réseaux Sociaux
- Posts publiés : ${data.postsCount}
- Engagement moyen : ${data.avgEngagement}%

### SEO
- Score performance : ${data.seoScore}/100
- Alertes : ${data.seoIssues.join(', ') || 'aucune alerte'}

## Consignes :
1. Résume la semaine en 2 phrases max
2. Identifie 2 points forts de la semaine
3. Identifie 1-2 points d'attention
4. Donne 3 actions immédiates pour la semaine suivante
5. Compare brièvement avec les concurrents si pertinent
6. Score global de la semaine entre 0 et 100`
}

export function alertPrompt(businessName: string, issue: string): string {
  return `Tu es un consultant business expert du marché réunionnais.
L'entreprise "${businessName}" a une alerte critique : ${issue}.

Fournis 3 recommandations immédiates et concrètes pour gérer cette situation,
en tenant compte du contexte et des habitudes du marché réunionnais.`
}
