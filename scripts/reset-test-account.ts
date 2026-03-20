/**
 * Script : reset-test-account.ts
 * - Supprime l'organisation SING DEVELOPMENT (et toutes ses données)
 * - Crée un compte test premium complet avec données réalistes
 *
 * Usage : npx tsx --env-file=.env.local scripts/reset-test-account.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`\n✅ ${msg}`) }
function warn(msg: string) { console.log(`⚠️  ${msg}`) }

async function deleteOrgByName(name: string) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .ilike('name', `%${name}%`)
    .single()

  if (!org) { warn(`Organisation "${name}" introuvable — ignoré`); return }

  const orgId = org.id
  log(`Organisation trouvée : ${orgId}`)

  // Supprimer les données dans l'ordre (FK constraints)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('organization_id', orgId)

  for (const b of businesses ?? []) {
    await supabase.from('reviews').delete().eq('business_id', b.id)
    await supabase.from('social_posts').delete().eq('business_id', b.id)
    await supabase.from('seo_snapshots').delete().eq('business_id', b.id)
  }

  await supabase.from('businesses').delete().eq('organization_id', orgId)
  await supabase.from('ai_reports').delete().eq('organization_id', orgId)

  // Récupérer les users liés
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', orgId)

  await supabase.from('profiles').delete().eq('organization_id', orgId)
  await supabase.from('organizations').delete().eq('id', orgId)

  for (const p of profiles ?? []) {
    await supabase.auth.admin.deleteUser(p.id)
  }

  log(`Organisation "${name}" et toutes ses données supprimées`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Début du reset compte test\n' + '─'.repeat(50))

  // ── 1. Supprimer SING DEVELOPMENT ──
  await deleteOrgByName('SING')

  // ── 2. Créer l'utilisateur Auth ──
  const email = 'contact@singdevelopment.fr'
  const password = 'J@d7#nm#PPCdMrsn'

  // Supprimer si déjà existant
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users.find(u => u.email === email)
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id)
    log(`Ancien utilisateur ${email} supprimé`)
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) throw new Error(`Auth: ${authError.message}`)
  const userId = authData.user.id
  log(`Utilisateur créé : ${userId}`)

  // ── 3. Nettoyer org orpheline éventuelle + créer l'organisation ──
  await supabase.from('organizations').delete().eq('slug', 'le-lagon-bleu')

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: 'Le Lagon Bleu',
      slug: 'le-lagon-bleu',
      plan: 'premium',
    })
    .select()
    .single()
  if (orgError) throw new Error(`Org: ${orgError.message}`)
  log(`Organisation créée : ${org.id}`)

  // ── 4. Créer le profil ──
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      organization_id: org.id,
      role: 'admin',
      full_name: 'Marie Dupont',
    })
  if (profileError) throw new Error(`Profile: ${profileError.message}`)
  log('Profil créé')

  // ── 5. Créer le business principal ──
  // Restaurant réel : Le Lagon Bleu à Saint-Gilles-les-Bains, La Réunion
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({
      organization_id: org.id,
      name: 'Le Lagon Bleu',
      google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Saint-Gilles placeholder
      website_url: 'https://www.restaurant-lelagonbleu.re',
      is_competitor: false,
      google_rating: 4.3,
      google_reviews_count: 312,
      lat: -21.0558,
      lng: 55.2282,
    })
    .select()
    .single()
  if (bizError) throw new Error(`Business: ${bizError.message}`)
  log(`Business créé : ${business.id}`)

  // ── 6. Ajouter les concurrents ──
  const competitors = [
    {
      name: "L'Ile aux Saveurs",
      website_url: 'https://www.ilieauxsaveurs.re',
      google_rating: 4.1,
      google_reviews_count: 187,
      lat: -21.0512, lng: 55.2301,
      opening_hours: 'Mar-Dim 11h30-14h30, 18h-22h',
      google_photos_count: 14,
      review_response_rate: 18,
      recent_reviews_count: 4,
      competitor_seo_score: 55,
      competitor_lcp_ms: 3400,
    },
    {
      name: 'Le Récif Restaurant',
      website_url: 'https://www.lerecifsaintgilles.com',
      google_rating: 4.5,
      google_reviews_count: 428,
      lat: -21.0589, lng: 55.2265,
      opening_hours: 'Lun-Dim 12h-22h',
      google_photos_count: 47,
      review_response_rate: 64,
      recent_reviews_count: 12,
      competitor_seo_score: 73,
      competitor_lcp_ms: 2100,
    },
  ]

  for (const c of competitors) {
    await supabase.from('businesses').insert({
      organization_id: org.id,
      ...c,
      is_competitor: true,
      google_place_id: null,
    })
  }
  log(`${competitors.length} concurrents ajoutés`)

  // ── 7. Insérer des avis Google ──
  const reviews = [
    { author_name: 'Sophie M.', rating: 5, text: 'Cadre magnifique face au lagon, les poissons grillés étaient excellents. Service impeccable et personnel très accueillant. On reviendra sans hésiter !', published_at: '2026-02-15' },
    { author_name: 'Jean-Pierre R.', rating: 5, text: 'Le meilleur restaurant de Saint-Gilles selon moi. Le rougail saucisse était authentique, les prix raisonnables pour la qualité. Vue sur mer splendide.', published_at: '2026-02-10' },
    { author_name: 'Amélie T.', rating: 4, text: 'Très bonne adresse, le carry poulet était savoureux. Petit bémol sur le temps d\'attente un samedi soir, mais ça vaut le coup.', published_at: '2026-01-28' },
    { author_name: 'Lucas B.', rating: 5, text: 'Repas de famille parfait ! Grande tablée, tout le monde était ravi. Les desserts créoles sont à tomber, le gâteau patate était délicieux.', published_at: '2026-01-22' },
    { author_name: 'Nathalie V.', rating: 3, text: 'Cuisine correcte mais sans grande surprise. Le service était un peu lent ce jour-là. La terrasse est agréable mais bruyante le weekend.', published_at: '2026-01-18' },
    { author_name: 'Thierry G.', rating: 5, text: 'Incroyable découverte ! Le cari thon frais était exceptionnel, pêche du jour vraiment fraîche. L\'équipe est aux petits soins. Endroit à recommander absolument.', published_at: '2026-01-12' },
    { author_name: 'Céline P.', rating: 4, text: 'Belle soirée en amoureux. Menu varié, les entrées de fruits de mer très fraîches. Bonne cave à vins locaux. On a apprécié le cadre.', published_at: '2026-01-05' },
    { author_name: 'Marc A.', rating: 2, text: 'Déçu pour le prix. Ma viande était trop cuite malgré ma demande. Le serveur n\'a pas semblé s\'en préoccuper. Peut-être une mauvaise soirée.', published_at: '2025-12-28' },
    { author_name: 'Isabelle F.', rating: 5, text: 'On a fêté notre anniversaire de mariage ici, tout était parfait. Chef très talentueux, fruits de mer ultra-frais. Merci pour ce moment magique !', published_at: '2025-12-20' },
    { author_name: 'Patrick D.', rating: 4, text: 'Le poisson du jour grillé était excellent, accompagnements bien assaisonnés. Terrasse en bord de mer très agréable. Je recommande le ti-punch maison.', published_at: '2025-12-15' },
    { author_name: 'Vanessa L.', rating: 5, text: 'Meilleur carry de l\'île ! La patronne est adorable et vous fait sentir comme chez vous. Les portions sont généreuses et les prix très corrects.', published_at: '2025-12-08' },
    { author_name: 'Rémi C.', rating: 3, text: 'Correct sans être mémorable. Le cari lentilles manquait un peu de piment à mon goût. Service aimable mais débordé le dimanche midi.', published_at: '2025-11-30' },
    { author_name: 'Aurore N.', rating: 5, text: 'Coup de coeur pour ce restaurant ! Poissons locaux préparés avec talent, sauce chien maison parfaite. Vue sur le lagon à couper le souffle. Parfait !', published_at: '2025-11-22' },
    { author_name: 'David K.', rating: 4, text: 'Très bonne expérience culinaire. Brochettes de langouste excellentes même si un peu chères. Cadre pittoresque, équipe sympathique. À refaire !', published_at: '2025-11-15' },
    { author_name: 'Laure S.', rating: 5, text: 'Restaurant incontournable à Saint-Gilles ! Le plateau de fruits de mer est à partager absolument. Cuisson parfaite, fraîcheur garantie. On adore.', published_at: '2025-11-08' },
    { author_name: 'François M.', rating: 4, text: 'Bonne table locale. Le rougail boucané fondait en bouche. Accompagnement de riz coco très original. Dommage que le parking soit difficile le soir.', published_at: '2025-10-28' },
    { author_name: 'Sandrine B.', rating: 1, text: 'Très mauvaise expérience. Temps d\'attente de 45 minutes, plat raté, et l\'addition ne correspondait pas à la commande. Ne reviendrai pas.', published_at: '2025-10-20' },
    { author_name: 'Nicolas T.', rating: 5, text: 'La meilleure adresse pour goûter la vraie cuisine réunionnaise ! Le cari cabri était fondant, servi avec des grains bien relevés. Service chaleureux.', published_at: '2025-10-12' },
    { author_name: 'Marie-Claude R.', rating: 4, text: 'Agréable déjeuner en famille. Enfants bien accueillis, menu adapté. Salade de palmiste en entrée superbe. On est venus trois fois cette année !', published_at: '2025-10-05' },
    { author_name: 'Thomas V.', rating: 5, text: 'Excellent ! Nous étions un groupe de 10, tout s\'est parfaitement déroulé. La cuisine est généreuse et authentique, les cocktails de bienvenue excellents.', published_at: '2025-09-28' },
  ]

  const reviewRows = reviews.map(r => ({
    business_id: business.id,
    author_name: r.author_name,
    rating: r.rating,
    text: r.text,
    published_at: r.published_at,
    source: 'google' as const,
    collected_at: new Date().toISOString(),
  }))

  const { error: reviewError } = await supabase.from('reviews').insert(reviewRows)
  if (reviewError) throw new Error(`Reviews: ${reviewError.message}`)
  log(`${reviews.length} avis Google insérés`)

  // ── 8. Insérer snapshot SEO ──
  const { error: seoError } = await supabase.from('seo_snapshots').insert({
    business_id: business.id,
    url: 'https://www.restaurant-lelagonbleu.re',
    status_code: 200,
    load_time_ms: 1840,
    title: 'Le Lagon Bleu - Restaurant de la mer à Saint-Gilles-les-Bains, La Réunion',
    meta_description: 'Découvrez Le Lagon Bleu, restaurant de poissons et fruits de mer face au lagon de Saint-Gilles. Cuisine créole authentique, pêche du jour, terrasse vue mer.',
    h1_count: 1,
    h2_count: 4,
    h3_count: 6,
    has_ssl: true,
    mobile_friendly: true,
    lighthouse_score: 67,
    mobile_performance_score: 67,
    desktop_performance_score: 85,
    accessibility_score: 78,
    seo_audit_score: 82,
    best_practices_score: 74,
    page_size_kb: 2340,
    fcp_ms: 1200,
    lcp_ms: 2800,
    cls_score: 0.08,
    tbt_ms: 180,
    speed_index_ms: 2100,
    word_count: 640,
    total_images: 12,
    images_without_alt: 4,
    internal_links_count: 18,
    external_links_count: 3,
    has_sitemap: true,
    has_robots_txt: true,
    has_schema: false,
    has_og_tags: true,
    og_title: 'Le Lagon Bleu - Restaurant Saint-Gilles La Réunion',
    og_description: 'Restaurant face au lagon, spécialités de la mer et cuisine créole authentique.',
    og_image: 'https://www.restaurant-lelagonbleu.re/images/terrasse-lagon.jpg',
    canonical_url: 'https://www.restaurant-lelagonbleu.re',
    title_length: 72,
    meta_description_length: 158,
    collected_at: new Date().toISOString(),
  })
  if (seoError) throw new Error(`SEO: ${seoError.message}`)
  log('Snapshot SEO inséré')

  // ── 9. Insérer posts réseaux sociaux ──
  const socialPosts = [
    // Facebook
    { platform: 'facebook', content: '🐟 Arrivage du jour ! Thon albacore frais pêché ce matin au large de Saint-Gilles. Ce soir au menu : thon mi-cuit sauce vierge et légumes du jardin. Réservez vite, les places sont limitées ! 📞 0262 XX XX XX', likes: 87, comments: 23, shares: 14, published_at: '2026-02-20' },
    { platform: 'facebook', content: '🎉 Merci pour vos 300 avis Google ! Vous êtes formidables, c\'est grâce à vous qu\'on continue avec autant de passion. Pour fêter ça, offre spéciale ce weekend : dessert maison offert pour toute table de 2 personnes minimum. 🍮', likes: 134, comments: 45, shares: 31, published_at: '2026-02-14' },
    { platform: 'facebook', content: '☀️ Dimanche midi en terrasse avec vue sur le lagon... Il n\'y a pas mieux pour se ressourcer ! Notre formule déjeuner à 22€ : entrée + plat + café. Venez profiter du soleil réunionnais avec nous 🌴', likes: 62, comments: 11, shares: 8, published_at: '2026-02-09' },
    { platform: 'facebook', content: '🦞 Retour des langoustes grillées sur notre carte ! Pêche locale, préparation au beurre citronné ou sauce créole. Disponibles du jeudi au dimanche, selon arrivage. Une expérience gustative unique face au lagon.', likes: 98, comments: 34, shares: 19, published_at: '2026-01-30' },
    { platform: 'facebook', content: '👨‍🍳 Dans les coulisses du Lagon Bleu : notre chef Kevin prépare le rougail tomates maison. Tomates du jardin, gingembre frais, piments de Cayenne... La recette secrète de sa grand-mère ! 🍅', likes: 156, comments: 67, shares: 42, published_at: '2026-01-22' },
    { platform: 'facebook', content: 'FERMETURE EXCEPTIONNELLE lundi 27 janvier pour congé annuel de l\'équipe. Nous sommes de retour mardi 28 avec plein d\'énergie et de nouvelles recettes ! Merci de votre compréhension 🙏', likes: 28, comments: 9, shares: 4, published_at: '2026-01-25' },
    // Instagram
    { platform: 'instagram', content: 'Coucher de soleil sur le lagon 🌅 Il n\'y a pas de plus beau décor pour déguster nos poissons du jour. Ce soir, poulpe sauté au gingembre et citron confit. On vous attend ! #LagunBleu #SaintGilles #Réunion #974 #RestaurantReunion #CuisineCreole', likes: 203, comments: 28, shares: 0, published_at: '2026-02-18' },
    { platform: 'instagram', content: 'Notre salade de palmiste 🌿 La reine des entrées créoles ! Fraîcheur absolue, vinaigrette maison aux agrumes. Chaque assiette est une oeuvre d\'art. #Palmiste #CreoleCooking #IleDeLaReunion #FoodPhotography #974', likes: 178, comments: 19, shares: 0, published_at: '2026-02-12' },
    { platform: 'instagram', content: 'Langouste grillée au beurre d\'herbes 🦞✨ La star de notre carte. Pêche locale, fraîcheur garantie, cuisson parfaite. Chaque bouchée est un voyage. Disponible sur réservation. #Langouste #Seafood #ReunionIsland #GastronomieCréole', likes: 312, comments: 54, shares: 0, published_at: '2026-02-05' },
    { platform: 'instagram', content: 'Ti\'punch du vendredi soir 🍹 Rhum arrangé maison, sirop de canne artisanal, citron du jardin. La meilleure façon de commencer le weekend réunionnais ! #TiPunch #RhumArrange #Reunion974 #AperoTime #IslandLife', likes: 267, comments: 41, shares: 0, published_at: '2026-01-31' },
    { platform: 'instagram', content: 'Carry de cabri du dimanche 🍲 Tradition réunionnaise par excellence ! Mijoté 3h avec curcuma frais, gingembre et piments. Servi avec riz blanc et grains rouges. Le vrai goût de la Réunion 🌺 #CarryDeCabri #CuisineReunionnaise #Sunday #Authentique', likes: 189, comments: 32, shares: 0, published_at: '2026-01-26' },
    { platform: 'instagram', content: 'Vue depuis notre terrasse ce matin ☀️🌊 Le lagon de Saint-Gilles dans toute sa splendeur. On ouvre à midi, venez déjeuner dans ce cadre de rêve. Réservations au 0262 XX XX XX #Lagon #SaintGilles #ViewFromHere #Réunion #Paradis', likes: 445, comments: 63, shares: 0, published_at: '2026-01-20' },
  ]

  const socialRows = socialPosts.map(p => ({
    business_id: business.id,
    platform: p.platform as 'facebook' | 'instagram',
    content: p.content,
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
    published_at: p.published_at,
    collected_at: new Date().toISOString(),
  }))

  const { error: socialError } = await supabase.from('social_posts').insert(socialRows)
  if (socialError) throw new Error(`Social: ${socialError.message}`)
  log(`${socialPosts.length} posts réseaux sociaux insérés`)

  // ── 10. Insérer un rapport IA ──
  const { error: reportError } = await supabase.from('ai_reports').insert({
    organization_id: org.id,
    report_type: 'monthly',
    generated_at: new Date().toISOString(),
    summary: 'Le Lagon Bleu affiche de solides performances avec une note Google de 4,3/5 et une communauté engagée sur les réseaux sociaux. La notoriété locale est forte mais le site web souffre de lenteurs techniques et d\'un manque de données structurées qui limitent la visibilité en ligne.',
    content: {
      summary: 'Le Lagon Bleu affiche de solides performances avec une note Google de 4,3/5 et une communauté engagée sur les réseaux sociaux. La notoriété locale est forte mais le site web souffre de lenteurs techniques et d\'un manque de données structurées qui limitent la visibilité en ligne.',
      strengths: [
        'Note Google excellente (4,3/5) avec 312 avis — forte crédibilité locale',
        'Engagement Instagram très élevé (moyenne 266 likes/post) — communauté fidèle',
        'Cuisine authentique reconnue : plusieurs mentions du "meilleur carry" de Saint-Gilles',
        'Positionnement unique face au lagon — atout concurrentiel fort sur le marché réunionnais',
      ],
      weaknesses: [
        'Site web lent (LCP 2,8s) et score performance faible (67/100) — pénalise le référencement Google',
        'Aucune donnée structurée (Schema.org) : pas de rich snippets dans les résultats de recherche',
        '4 images sans attribut alt sur 12 — accessibilité et SEO à améliorer',
      ],
      recommendations: [
        { priority: 'haute', action: 'Implémenter Schema.org LocalBusiness + Restaurant sur le site', impact: 'Affichage rich snippets dans Google (horaires, note, avis) — +20% de clics estimés' },
        { priority: 'haute', action: 'Optimiser les images (WebP, lazy loading) pour passer LCP sous 2,5s', impact: 'Meilleur classement Google + expérience mobile améliorée pour les touristes' },
        { priority: 'moyenne', action: 'Répondre systématiquement aux avis 1-2 étoiles sous 48h', impact: 'Montre le professionnalisme — réduit l\'impact des avis négatifs sur la note globale' },
        { priority: 'moyenne', action: 'Publier 4-5 posts Instagram/semaine avec géolocalisation Saint-Gilles', impact: 'Augmentation de la visibilité locale +35% selon les benchmarks restauration 974' },
        { priority: 'basse', action: 'Créer une page Google My Business optimisée avec photos récentes et menu', impact: 'Meilleure conversion des recherches "restaurant saint-gilles réunion"' },
      ],
      competitor_analysis: 'Le Récif Restaurant (4,5/5, 428 avis) devance légèrement Le Lagon Bleu en termes de volume d\'avis. Pour réduire cet écart, une campagne de collecte d\'avis post-repas (QR code sur l\'addition) est recommandée. L\'Ile aux Saveurs (4,1/5, 187 avis) est en retrait et ne représente pas une menace immédiate. L\'avantage concurrentiel du Lagon Bleu réside dans son positionnement unique bord de lagon et son engagement social supérieur.',
      score_global: 71,
    },
    recommendations: [
      { priority: 'haute', action: 'Implémenter Schema.org LocalBusiness + Restaurant sur le site', impact: 'Affichage rich snippets dans Google (horaires, note, avis) — +20% de clics estimés' },
      { priority: 'haute', action: 'Optimiser les images (WebP, lazy loading) pour passer LCP sous 2,5s', impact: 'Meilleur classement Google + expérience mobile améliorée pour les touristes' },
      { priority: 'moyenne', action: 'Répondre systématiquement aux avis 1-2 étoiles sous 48h', impact: 'Montre le professionnalisme — réduit l\'impact des avis négatifs sur la note globale' },
      { priority: 'moyenne', action: 'Publier 4-5 posts Instagram/semaine avec géolocalisation Saint-Gilles', impact: 'Augmentation de la visibilité locale +35% selon les benchmarks restauration 974' },
      { priority: 'basse', action: 'Créer une page Google My Business optimisée avec photos récentes et menu', impact: 'Meilleure conversion des recherches "restaurant saint-gilles réunion"' },
    ],
  })
  if (reportError) throw new Error(`Report: ${reportError.message}`)
  log('Rapport IA mensuel inséré')

  // ── Résumé final ──
  console.log('\n' + '─'.repeat(50))
  console.log('🎉 Compte test créé avec succès !\n')
  console.log(`  Email    : ${email}`)
  console.log(`  Password : ${password}`)
  console.log(`  Plan     : premium`)
  console.log(`  Business : Le Lagon Bleu (restaurant, Saint-Gilles, La Réunion)`)
  console.log(`  Avis     : ${reviews.length} avis Google`)
  console.log(`  Social   : ${socialPosts.length} posts (6 Facebook + 6 Instagram)`)
  console.log(`  Concurrents : ${competitors.length}`)
  console.log(`  SEO      : 1 snapshot (score 67/100)`)
  console.log(`  Rapport IA : 1 rapport mensuel complet`)
  console.log('─'.repeat(50))
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message)
  process.exit(1)
})
