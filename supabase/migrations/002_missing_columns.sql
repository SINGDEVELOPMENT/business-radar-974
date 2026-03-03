-- =============================================================
-- Business Radar 974 — Migration 002
-- Colonnes manquantes (J6-J7) + champs nécessaires pour le CRON (J8)
-- =============================================================

-- ---------------------------------------------------------------
-- seo_snapshots : taille de page (utilisée par seo-audit.ts)
-- ---------------------------------------------------------------
ALTER TABLE seo_snapshots
  ADD COLUMN IF NOT EXISTS page_size_kb INTEGER;

-- ---------------------------------------------------------------
-- businesses : note et nombre d'avis Google pour les concurrents
-- (utilisés par competitors.ts lors de l'upsert)
-- ---------------------------------------------------------------
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_rating       NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;

-- Contrainte unique requise par l'upsert dans competitors.ts
-- (onConflict: 'organization_id,google_place_id')
ALTER TABLE businesses
  ADD CONSTRAINT businesses_org_place_unique
  UNIQUE (organization_id, google_place_id);

-- ---------------------------------------------------------------
-- Jour 8 — collecte automatique (CRON)
-- ---------------------------------------------------------------

-- Token d'accès Meta (Facebook/Instagram) par organisation.
-- Utilisé par le CRON pour collecter les posts sans intervention manuelle.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS meta_access_token TEXT;

-- Coordonnées GPS du business principal.
-- Requises pour la recherche hebdomadaire de concurrents via Google Places.
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- ID numérique du compte Instagram Business.
-- Différent du @username : c'est l'ID renvoyé par Meta Graph API
-- (GET /{facebook-page-id}?fields=instagram_business_account).
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS instagram_business_id TEXT;
