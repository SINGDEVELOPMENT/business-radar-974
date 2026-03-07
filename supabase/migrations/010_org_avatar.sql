-- Migration 010 : avatar logo organisation
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS avatar_url TEXT;
