// Données fictives pour le mode démo — "Le Barachois" restaurant fictif à Saint-Gilles-les-Bains

export const DEMO_BUSINESS = {
  name: 'Le Barachois',
  address: '12 Rue du Port, 97434 Saint-Gilles-les-Bains',
  website: 'https://www.lebarachois-demo.re',
  googleRating: 4.3,
  googleReviewsCount: 127,
}

export const DEMO_REVIEWS = [
  { id: '1', author_name: 'Marie-Claire T.', rating: 5, text: 'Excellent restaurant ! La vue sur le lagon est magnifique, le service impeccable et les grillades de thon vraiment délicieuses. On reviendra sans hésitation.', published_at: '2026-02-28', source: 'google' },
  { id: '2', author_name: 'Jean-Pierre L.', rating: 5, text: 'Une adresse incontournable à La Réunion. Cadre idyllique, cuisine créole authentique, accueil chaleureux. Le cari de canard était parfait.', published_at: '2026-02-25', source: 'google' },
  { id: '3', author_name: 'Sophie M.', rating: 4, text: 'Très belle expérience. Les poissons grillés sont frais et bien préparés. Un peu d\'attente pour être servis mais ça valait le coup.', published_at: '2026-02-20', source: 'google' },
  { id: '4', author_name: 'Thomas R.', rating: 2, text: 'Déçu par notre visite ce soir. Le service était lent, on a attendu 45 minutes pour être servis. Le poisson était bon mais la sauce manquait de saveur.', published_at: '2026-02-18', source: 'google' },
  { id: '5', author_name: 'Isabelle N.', rating: 5, text: 'Nous avons fêté notre anniversaire de mariage ici. Personnel aux petits soins, la vue est à couper le souffle au coucher du soleil. Merci pour cette soirée magique !', published_at: '2026-02-15', source: 'google' },
  { id: '6', author_name: 'Éric B.', rating: 4, text: 'Bon rapport qualité-prix pour La Réunion. Le menu créole est complet et copieux. Je recommande les bouchons en entrée.', published_at: '2026-02-10', source: 'google' },
  { id: '7', author_name: 'Nathalie F.', rating: 3, text: 'Endroit agréable mais un peu bruyant. La nourriture est correcte sans être exceptionnelle. Le cadre sauve l\'expérience.', published_at: '2026-02-08', source: 'google' },
  { id: '8', author_name: 'David K.', rating: 5, text: 'Le meilleur restaurant de la côte ouest ! Impossible de ne pas être séduit par la vue et la fraîcheur des produits. Le rougail saucisses est fantastique.', published_at: '2026-02-05', source: 'google' },
  { id: '9', author_name: 'Martine V.', rating: 1, text: 'Très déçue. Commande incorrecte, staff peu attentionné. Pour le prix demandé, on est en droit d\'attendre mieux. Ne reviendrai pas.', published_at: '2026-01-30', source: 'google' },
  { id: '10', author_name: 'Christophe D.', rating: 4, text: 'Parfait pour un déjeuner en famille. Les enfants ont adoré voir les bateaux. Carte variée avec de belles options végétariennes.', published_at: '2026-01-27', source: 'google' },
  { id: '11', author_name: 'Pauline G.', rating: 5, text: 'Quelle belle découverte ! L\'emplacement face au port est unique. Le cocktail punch maison est délicieux. On regrette juste de ne pas avoir réservé plus tôt.', published_at: '2026-01-22', source: 'google' },
  { id: '12', author_name: 'Alain M.', rating: 4, text: 'Très bonne cuisine locale, des produits de qualité. Le service pourrait être un peu plus rapide aux heures de pointe mais dans l\'ensemble une belle adresse.', published_at: '2026-01-15', source: 'google' },
]

export const DEMO_REVIEWS_CHART = [
  { month: 'mars 25', avgRating: 4.1, count: 8 },
  { month: 'avr. 25', avgRating: 4.0, count: 7 },
  { month: 'mai 25', avgRating: 4.3, count: 11 },
  { month: 'juin 25', avgRating: 4.5, count: 14 },
  { month: 'juil. 25', avgRating: 4.4, count: 18 },
  { month: 'août 25', avgRating: 4.2, count: 16 },
  { month: 'sept. 25', avgRating: 4.1, count: 9 },
  { month: 'oct. 25', avgRating: 4.3, count: 10 },
  { month: 'nov. 25', avgRating: 4.4, count: 8 },
  { month: 'déc. 25', avgRating: 4.6, count: 13 },
  { month: 'janv. 26', avgRating: 4.2, count: 7 },
  { month: 'févr. 26', avgRating: 4.3, count: 6 },
]

export const DEMO_SOCIAL_POSTS = [
  { id: 's1', platform: 'facebook', content: '🌅 Coucher de soleil magique depuis notre terrasse ce soir ! Réservez votre table pour profiter de ce spectacle unique avec nos spécialités créoles.', likes: 187, comments: 34, shares: 28, published_at: '2026-02-26' },
  { id: 's2', platform: 'instagram', content: '✨ Notre cari de thon albacore du jour, pêché ce matin par nos partenaires locaux. Fraîcheur garantie ! #lebarachois #reunionnais #creole', likes: 312, comments: 47, shares: 0, published_at: '2026-02-24' },
  { id: 's3', platform: 'facebook', content: 'Menu spécial fête des mères ce dimanche ! Profitez d\'un repas d\'exception avec vue sur le lagon. Réservations ouvertes. ❤️', likes: 143, comments: 52, shares: 41, published_at: '2026-02-22' },
  { id: 's4', platform: 'instagram', content: 'Le punch maison à la vanille de Bourbon... une signature Le Barachois 🍹 #punch #reunion974 #authentique', likes: 264, comments: 31, shares: 0, published_at: '2026-02-19' },
  { id: 's5', platform: 'facebook', content: 'Nouveau partenariat avec les pêcheurs de Saint-Gilles ! Des poissons encore plus frais chaque matin sur notre carte. 🐠', likes: 98, comments: 19, shares: 15, published_at: '2026-02-16' },
  { id: 's6', platform: 'instagram', content: 'La vue depuis notre terrasse au lever du soleil... Un privilège de travailler dans ce cadre 🌊 #saintgilles #lagonbleu', likes: 421, comments: 63, shares: 0, published_at: '2026-02-14' },
  { id: 's7', platform: 'facebook', content: 'Merci à tous nos fidèles clients pour vos retours positifs sur Google ! Vos avis nous motivent à nous améliorer chaque jour. 🙏', likes: 76, comments: 28, shares: 8, published_at: '2026-02-10' },
  { id: 's8', platform: 'instagram', content: 'Rougail saucisses tradition servi avec riz créole et grains rouges 🍛 Plat du jour disponible ce midi uniquement. #carirunion #creole', likes: 289, comments: 44, shares: 0, published_at: '2026-02-07' },
]

export const DEMO_SOCIAL_CHART = [
  { date: '1 janv.', facebook: 145, instagram: 230 },
  { date: '8 janv.', facebook: 198, instagram: 312 },
  { date: '15 janv.', facebook: 167, instagram: 287 },
  { date: '22 janv.', facebook: 210, instagram: 345 },
  { date: '29 janv.', facebook: 189, instagram: 298 },
  { date: '5 févr.', facebook: 223, instagram: 421 },
  { date: '12 févr.', facebook: 317, instagram: 489 },
  { date: '19 févr.', facebook: 264, instagram: 412 },
  { date: '26 févr.', facebook: 330, instagram: 508 },
]

export const DEMO_SEO_SCORE = 78
export const DEMO_SEO_LATEST = {
  url: 'https://www.lebarachois-demo.re',
  status_code: 200,
  load_time_ms: 1840,
  has_ssl: true,
  mobile_friendly: true,
  title: 'Le Barachois — Restaurant créole & fruits de mer à Saint-Gilles',
  meta_description: 'Découvrez Le Barachois, restaurant incontournable de Saint-Gilles-les-Bains avec vue sur le lagon. Cuisine créole authentique, poissons frais et grillades.',
  h1_count: 1,
  lighthouse_score: 78,
  accessibility_score: 92,
  seo_audit_score: 91,
  best_practices_score: 83,
  fcp_ms: 1240,
  lcp_ms: 2180,
  cls_score: 0.08,
  tbt_ms: 145,
  speed_index_ms: 2890,
  page_size_kb: 342,
  collected_at: '2026-03-03T06:00:00Z',
  opportunities: [
    { id: 'unused-javascript', title: 'Réduire le JavaScript inutilisé', displayValue: 'Économie potentielle : 0.4 s', score: 42 },
    { id: 'uses-webp-images', title: 'Utiliser des formats d\'image nouvelle génération (WebP)', displayValue: '3 images à convertir', score: 55 },
    { id: 'render-blocking-resources', title: 'Éliminer les ressources bloquant le rendu', displayValue: 'Économie potentielle : 0.2 s', score: 68 },
  ],
}

export const DEMO_SEO_CHART = [
  { date: '4 févr.', score: 71 },
  { date: '7 févr.', score: 73 },
  { date: '10 févr.', score: 71 },
  { date: '13 févr.', score: 74 },
  { date: '16 févr.', score: 76 },
  { date: '19 févr.', score: 75 },
  { date: '22 févr.', score: 77 },
  { date: '25 févr.', score: 76 },
  { date: '28 févr.', score: 78 },
  { date: '3 mars', score: 78 },
]

export const DEMO_REPORT = {
  generated_at: '2026-03-01T06:00:00Z',
  report_type: 'monthly',
  summary: 'Le Barachois maintient une position solide sur la côte ouest avec une note Google de 4.3/5 basée sur 127 avis. L\'engagement Instagram est en forte progression (+18% ce mois) grâce à du contenu visuel attractif. Le score SEO de 78/100 est bon mais peut encore progresser pour renforcer la visibilité organique. Votre principal concurrent, La Voile Blanche, a amélioré sa note de 0.2 point — vigilance recommandée.',
  score_global: 74,
  strengths: [
    'Note Google supérieure à la moyenne locale (4.3 vs 4.0 pour la zone)',
    'Engagement Instagram en hausse de 18% avec des posts à fort potentiel viral',
    'Positionnement premium bien établi — clientèle fidèle et régulière',
    'Temps de chargement du site excellent (1.8s) — expérience mobile fluide',
  ],
  weaknesses: [
    '3 avis 1-2 étoiles ce mois sans réponse publiée — risque de réputation',
    'Absence de balise schema.org Restaurant — freine le référencement local',
    'Fréquence de publication Facebook en baisse (2 posts/semaine vs 4 recommandés)',
  ],
  recommendations: [
    { priority: 'haute', action: 'Répondre publiquement aux 3 avis négatifs récents sur Google Business', impact: 'Montre votre professionnalisme et rassure les futurs clients — peut convertir jusqu\'à 45% des indécis' },
    { priority: 'haute', action: 'Ajouter le balisage schema.org "Restaurant" sur votre site web', impact: 'Améliore l\'apparition dans les résultats locaux Google Maps et Search' },
    { priority: 'moyenne', action: 'Augmenter la cadence de publication Facebook à 4 posts/semaine', impact: 'Maintenir la visibilité organique et compenser le reach en baisse des pages Facebook' },
    { priority: 'basse', action: 'Créer une page Google My Business Posts hebdomadaire (menu du jour, événement)', impact: 'Boost gratuit de visibilité dans Google Maps et améliore la note de fraîcheur' },
  ],
  competitor_analysis: 'La Voile Blanche (4.1 → 4.3 ce mois) progresse rapidement grâce à une stratégie de réponse active aux avis. Le Lagon d\'Or reste stable à 3.9/5 mais affiche 89 avis de plus que vous. Votre différenciation par la qualité reste solide mais La Voile Blanche réduit l\'écart — une attention particulière à la gestion des avis s\'impose dans les prochains 30 jours.',
  previous_score: 69,
}

// Standard : 2 concurrents
export const DEMO_COMPETITORS = [
  { id: 'c1', name: 'Le Barachois', rating: 4.3, reviews: 127, isClient: true, website_url: 'https://www.lebarachois-demo.re', seo_score: 78, load_time_ms: 1840 },
  { id: 'c2', name: 'La Voile Blanche', rating: 4.3, reviews: 89, isClient: false, website_url: 'https://lavoileblanche.re', seo_score: 65, load_time_ms: 2340 },
  { id: 'c3', name: 'Le Lagon d\'Or', rating: 3.9, reviews: 216, isClient: false, website_url: 'https://lelagondor.re', seo_score: 52, load_time_ms: 3100 },
]

// Premium : 5 concurrents
export const DEMO_COMPETITORS_PREMIUM = [
  { id: 'c1', name: 'Le Barachois', rating: 4.3, reviews: 127, isClient: true, website_url: 'https://www.lebarachois-demo.re', seo_score: 78, load_time_ms: 1840 },
  { id: 'c2', name: 'La Voile Blanche', rating: 4.3, reviews: 89, isClient: false, website_url: 'https://lavoileblanche.re', seo_score: 65, load_time_ms: 2340 },
  { id: 'c3', name: 'Le Lagon d\'Or', rating: 3.9, reviews: 216, isClient: false, website_url: 'https://lelagondor.re', seo_score: 52, load_time_ms: 3100 },
  { id: 'c4', name: 'Chez Nous Saint-Gilles', rating: 4.1, reviews: 143, isClient: false, website_url: 'https://cheznous-saintgilles.re', seo_score: 44, load_time_ms: 3800 },
  { id: 'c5', name: 'Le Blue Marlin', rating: 4.0, reviews: 78, isClient: false, website_url: null, seo_score: null, load_time_ms: null },
]

export const DEMO_REPORTS_USED = 2
export const DEMO_REPORTS_LIMIT = 5
