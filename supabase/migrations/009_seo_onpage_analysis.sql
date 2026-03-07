-- Migration 009 — On-page SEO analysis (inspiré claude-seo)
-- Ajout colonnes pour : canonical, OG tags, structure titres, images, liens, schema, robots/sitemap

ALTER TABLE seo_snapshots
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS has_og_tags BOOLEAN,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS h2_count INTEGER,
  ADD COLUMN IF NOT EXISTS h3_count INTEGER,
  ADD COLUMN IF NOT EXISTS images_without_alt INTEGER,
  ADD COLUMN IF NOT EXISTS total_images INTEGER,
  ADD COLUMN IF NOT EXISTS internal_links_count INTEGER,
  ADD COLUMN IF NOT EXISTS external_links_count INTEGER,
  ADD COLUMN IF NOT EXISTS word_count INTEGER,
  ADD COLUMN IF NOT EXISTS has_sitemap BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_robots_txt BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_schema BOOLEAN,
  ADD COLUMN IF NOT EXISTS schema_types TEXT[],
  ADD COLUMN IF NOT EXISTS title_length INTEGER,
  ADD COLUMN IF NOT EXISTS meta_description_length INTEGER;
