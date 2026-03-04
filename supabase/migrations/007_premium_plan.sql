-- Migration 007 — Compteur rapports manuels mensuels + plan default
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS manual_reports_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_reports_reset_at TIMESTAMPTZ;

-- S'assurer que les orgs existantes ont un plan défini
UPDATE organizations SET plan = 'standard' WHERE plan IS NULL;
