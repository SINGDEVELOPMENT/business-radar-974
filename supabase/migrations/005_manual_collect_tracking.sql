ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_manual_collect_at TIMESTAMPTZ;
