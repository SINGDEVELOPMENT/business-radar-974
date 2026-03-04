-- Migration 003 : consentement RGPD pour la collecte des données sociales
-- À appliquer via : npx supabase db push

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS social_consent_given BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_consent_date  TIMESTAMPTZ;

COMMENT ON COLUMN businesses.social_consent_given IS
  'Le client a donné son consentement RGPD explicite pour la collecte de ses données réseaux sociaux (Facebook / Instagram).';
COMMENT ON COLUMN businesses.social_consent_date IS
  'Date à laquelle le consentement a été accordé ou révoqué.';
