/**
 * Script : add-test-reports.ts
 * Ajoute 2 rapports AI antédatés pour contact@singdevelopment.fr
 *
 * Usage : npx tsx --env-file=.env.local scripts/add-test-reports.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  // Trouver l'org
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'le-lagon-bleu')
    .single()

  if (!org) throw new Error('Organisation "le-lagon-bleu" introuvable')
  console.log('Org trouvée :', org.id)

  const reports = [
    // ── Rapport janvier 2026 ──
    {
      organization_id: org.id,
      report_type: 'monthly',
      generated_at: '2026-01-05T09:15:00Z',
      summary: 'Le Lagon Bleu termine l\'année sur une dynamique positive avec une note Google stable à 4,2/5. Cependant, janvier marque une légère baisse de l\'engagement sur les réseaux sociaux (−18%) due à la saison creuse. Le référencement local reste un point de friction majeur face au concurrent Le Récif Restaurant.',
      content: {
        summary: 'Le Lagon Bleu termine l\'année sur une dynamique positive avec une note Google stable à 4,2/5. Cependant, janvier marque une légère baisse de l\'engagement sur les réseaux sociaux (−18%) due à la saison creuse. Le référencement local reste un point de friction majeur face au concurrent Le Récif Restaurant.',
        strengths: [
          'Fidélité client forte : 6 clients récurrents ont laissé un avis en décembre — taux de fidélisation estimé à 23%',
          'Engagement Instagram en hausse de 12% sur les Reels — format privilégié par l\'algorithme',
          'Cuisine réunionnaise authentique unanimement saluée : 89% des avis mentionnent positivement les plats créoles',
        ],
        weaknesses: [
          'Site web vieillissant : score SEO de 67/100 nettement inférieur à Le Récif (82/100)',
          'Absence de réponse aux avis négatifs — 3 avis 1-2 étoiles sans réponse depuis novembre',
        ],
        recommendations: [
          { priority: 'haute', action: 'Répondre aux 3 avis négatifs de novembre-décembre sous 48h avec une proposition de compensation', impact: 'Améliore la perception publique et peut convertir des clients déçus en ambassadeurs' },
          { priority: 'haute', action: 'Lancer une campagne "Bonne Année" sur Facebook avec code promo de bienvenue', impact: 'Compenser la saisonnalité de janvier — objectif +15% couverts vs janvier N-1' },
          { priority: 'moyenne', action: 'Intégrer Google Schema LocalBusiness + Restaurant au site web', impact: 'Rich snippets dans les résultats Google — visibilité estimée +25% sur les recherches "restaurant saint-gilles"' },
          { priority: 'moyenne', action: 'Publier 3 Reels Instagram par semaine (plats du jour, coulisses, vue mer)', impact: 'Maintenir la portée organique en période creuse — budget 0€' },
          { priority: 'basse', action: 'Mettre à jour la carte Google My Business avec les nouveaux plats d\'hiver', impact: 'Améliore le taux de clic depuis Google Maps (+10% estimé)' },
        ],
        competitor_analysis: 'Le Récif Restaurant (4,5/5, 428 avis) consolide son avance avec un site web mieux optimisé (score SEO 82/100) et une présence Google My Business plus complète. L\'Ile aux Saveurs (4,1/5) reste en retrait mais a ouvert un compte TikTok actif qui cible les 18-35 ans — segment à ne pas négliger à La Réunion.',
        score_global: 65,
      },
      recommendations: [
        { priority: 'haute', action: 'Répondre aux 3 avis négatifs de novembre-décembre sous 48h', impact: 'Améliore la perception publique' },
        { priority: 'haute', action: 'Lancer une campagne "Bonne Année" sur Facebook avec code promo', impact: '+15% couverts estimé vs janvier N-1' },
        { priority: 'moyenne', action: 'Intégrer Google Schema LocalBusiness + Restaurant', impact: 'Visibilité +25% sur Google' },
      ],
    },

    // ── Rapport février 2026 ──
    {
      organization_id: org.id,
      report_type: 'monthly',
      generated_at: '2026-02-03T10:30:00Z',
      summary: 'Février confirme le rebond du Lagon Bleu avec une progression notable : la note Google passe à 4,3/5 (+0,1) grâce à 12 nouveaux avis positifs collectés après la campagne de sensibilisation. L\'engagement Instagram atteint un nouveau record avec 445 likes sur la publication du coucher de soleil. La saison touristique approche — il est temps d\'accélérer sur la visibilité digitale.',
      content: {
        summary: 'Février confirme le rebond du Lagon Bleu avec une progression notable : la note Google passe à 4,3/5 (+0,1) grâce à 12 nouveaux avis positifs collectés après la campagne de sensibilisation. L\'engagement Instagram atteint un nouveau record avec 445 likes sur la publication du coucher de soleil. La saison touristique approche — il est temps d\'accélérer sur la visibilité digitale.',
        strengths: [
          'Record d\'engagement Instagram : 445 likes sur le post "coucher de soleil" — meilleure performance de l\'histoire du compte',
          'Note Google en progression : 4,3/5 après 12 nouveaux avis 5 étoiles suite à la campagne de fidélisation',
          'Retour de la langouste grillée à la carte : post Facebook à 98 likes — fort appétit de la clientèle locale',
          'Équipe en pleine forme : plusieurs avis mentionnent l\'accueil chaleureux et le "chef Kevin" par son prénom',
        ],
        weaknesses: [
          'Score performance site web en légère dégradation (67→63/100) — images non optimisées alourdie par une galerie récente',
          'Zéro vente en ligne ou réservation digitale — dépendance totale au téléphone frein à la conversion des touristes',
        ],
        recommendations: [
          { priority: 'haute', action: 'Implémenter un système de réservation en ligne (Zenchef ou LaFourchette)', impact: 'Les touristes (30% des clients en saison) réservent quasi exclusivement en ligne — gain estimé +20% de couverts en saison haute' },
          { priority: 'haute', action: 'Optimiser la galerie photos du site (compression WebP, lazy loading)', impact: 'Score performance de 63 à 80+/100 — meilleur classement Google + expérience mobile fluide' },
          { priority: 'moyenne', action: 'Créer un Google Post hebdomadaire avec le plat du jour et le prix', impact: 'Visibilité sur Google Maps sans budget pub — cible les recherches "où manger saint-gilles aujourd\'hui"' },
          { priority: 'moyenne', action: 'Mettre en place un QR code sur l\'addition renvoyant vers Google Reviews', impact: 'Méthode la plus efficace pour collecter des avis — objectif +5 avis/semaine en saison haute' },
          { priority: 'basse', action: 'Explorer TikTok (15-30s max) sur les coulisses de la cuisine et la pêche du jour', impact: 'L\'Ile aux Saveurs a démarré TikTok — ne pas se laisser distancer sur le segment jeune touristique' },
        ],
        competitor_analysis: 'Le Récif Restaurant a intégré un système de réservation en ligne fin janvier — avance concurrentielle significative pour la saison touristique d\'avril-septembre. Il est urgent de rattraper ce retard. L\'Ile aux Saveurs reste stable mais son TikTok comptabilise désormais 1 200 abonnés après 2 mois — dynamique à surveiller.',
        score_global: 71,
      },
      recommendations: [
        { priority: 'haute', action: 'Implémenter un système de réservation en ligne (Zenchef ou LaFourchette)', impact: '+20% de couverts estimé en saison haute' },
        { priority: 'haute', action: 'Optimiser la galerie photos du site (compression WebP, lazy loading)', impact: 'Score 63→80/100, meilleur classement Google' },
        { priority: 'moyenne', action: 'Créer un Google Post hebdomadaire avec le plat du jour', impact: 'Visibilité Google Maps sans budget pub' },
      ],
    },
  ]

  const { error } = await supabase.from('ai_reports').insert(reports)
  if (error) throw new Error(`Insert: ${error.message}`)

  console.log('✅ 2 rapports antédatés insérés :')
  console.log('   - Janvier 2026 (score 65/100) — saison creuse, avis négatifs non traités')
  console.log('   - Février 2026 (score 71/100) — rebond, record Instagram, langouste')
}

main().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
