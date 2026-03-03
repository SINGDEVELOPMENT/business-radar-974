-- Ajout de la colonne page_size_kb sur seo_snapshots (J4)
ALTER TABLE seo_snapshots
  ADD COLUMN IF NOT EXISTS page_size_kb INTEGER;
