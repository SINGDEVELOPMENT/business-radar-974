-- Distingue les concurrents auto-détectés (Google Nearby) des concurrents manuels ajoutés par le client
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_competitor BOOLEAN NOT NULL DEFAULT false;

-- Index pour filtrer rapidement
CREATE INDEX IF NOT EXISTS idx_businesses_custom_competitor ON businesses(organization_id, custom_competitor) WHERE is_competitor = true;
