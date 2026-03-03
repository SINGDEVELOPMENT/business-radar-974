-- =============================================================
-- Migration 002 : Colonnes competitors + contrainte unique
-- =============================================================

-- Ajout des colonnes de données Google Places sur la table businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_rating        NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER,
  ADD COLUMN IF NOT EXISTS category             TEXT;

-- Contrainte unique nécessaire pour les upserts par (organization_id, google_place_id)
-- On utilise un index partiel sur les lignes ayant un google_place_id non nul
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_org_place
  ON businesses(organization_id, google_place_id)
  WHERE google_place_id IS NOT NULL;
