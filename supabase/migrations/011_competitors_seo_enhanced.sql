-- Migration 011 : Enrichissement des données concurrents et scores SEO mobile/desktop
--
-- Objectif : Deux axes d'amélioration du schéma
--
-- 1) Table `businesses` — nouvelles colonnes pour les fiches concurrents :
--    - Informations factuelles disponibles via Google Places (plan standard) :
--      horaires d'ouverture, nombre de photos.
--    - Données analytiques collectées en arrière-plan (plan premium) :
--      taux de réponse aux avis, volume d'avis récents, score SEO/LCP du site
--      concurrent et date de dernière collecte SEO.
--
-- 2) Table `seo_snapshots` — scores PageSpeed mobile et desktop séparés :
--    Jusqu'ici un seul `lighthouse_score` était stocké. On ajoute deux colonnes
--    distinctes pour différencier le score mobile (plus sévère) et le score desktop,
--    conformément à l'API Google PageSpeed Insights qui retourne les deux stratégies.
--
-- Toutes les colonnes utilisent ADD COLUMN IF NOT EXISTS pour être rejouables
-- sans erreur sur un environnement déjà partiellement migré.

-- ============================================================
-- Table businesses — données concurrents standard
-- ============================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS opening_hours TEXT;

COMMENT ON COLUMN businesses.opening_hours IS
  'Horaires d''ouverture synthétisés, ex: "Lun-Sam 9h-18h, Dim fermé"';

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_photos_count INTEGER DEFAULT 0;

COMMENT ON COLUMN businesses.google_photos_count IS
  'Nombre de photos Google associées à la fiche du concurrent';

-- ============================================================
-- Table businesses — données concurrents premium
-- ============================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS review_response_rate NUMERIC(5,2);

COMMENT ON COLUMN businesses.review_response_rate IS
  'Pourcentage de réponses du propriétaire aux avis Google (0-100). Premium uniquement.';

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS recent_reviews_count INTEGER DEFAULT 0;

COMMENT ON COLUMN businesses.recent_reviews_count IS
  'Nombre d''avis reçus sur les 30 derniers jours. Premium uniquement.';

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS competitor_seo_score INTEGER;

COMMENT ON COLUMN businesses.competitor_seo_score IS
  'Score PageSpeed Performance du site du concurrent (0-100). Premium uniquement.';

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS competitor_lcp_ms INTEGER;

COMMENT ON COLUMN businesses.competitor_lcp_ms IS
  'Largest Contentful Paint du site du concurrent en millisecondes. Premium uniquement.';

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS competitor_seo_collected_at TIMESTAMPTZ;

COMMENT ON COLUMN businesses.competitor_seo_collected_at IS
  'Horodatage de la dernière collecte SEO pour ce concurrent. Premium uniquement.';

-- ============================================================
-- Table seo_snapshots — scores mobile/desktop séparés
-- ============================================================

ALTER TABLE seo_snapshots
  ADD COLUMN IF NOT EXISTS mobile_performance_score INTEGER;

COMMENT ON COLUMN seo_snapshots.mobile_performance_score IS
  'Score PageSpeed Performance en stratégie mobile (0-100)';

ALTER TABLE seo_snapshots
  ADD COLUMN IF NOT EXISTS desktop_performance_score INTEGER;

COMMENT ON COLUMN seo_snapshots.desktop_performance_score IS
  'Score PageSpeed Performance en stratégie desktop (0-100)';

-- ============================================================
-- Index pour les nouvelles colonnes de filtrage/tri fréquent
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_businesses_competitor_seo_collected_at
  ON businesses (competitor_seo_collected_at)
  WHERE competitor_seo_collected_at IS NOT NULL;
