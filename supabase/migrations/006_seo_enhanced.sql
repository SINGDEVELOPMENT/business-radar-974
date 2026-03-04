-- Migration 006 — Core Web Vitals + scores PageSpeed complets
ALTER TABLE seo_snapshots
  ADD COLUMN IF NOT EXISTS fcp_ms INTEGER,
  ADD COLUMN IF NOT EXISTS lcp_ms INTEGER,
  ADD COLUMN IF NOT EXISTS cls_score FLOAT,
  ADD COLUMN IF NOT EXISTS tbt_ms INTEGER,
  ADD COLUMN IF NOT EXISTS speed_index_ms INTEGER,
  ADD COLUMN IF NOT EXISTS accessibility_score INTEGER,
  ADD COLUMN IF NOT EXISTS seo_audit_score INTEGER,
  ADD COLUMN IF NOT EXISTS best_practices_score INTEGER,
  ADD COLUMN IF NOT EXISTS opportunities JSONB;
