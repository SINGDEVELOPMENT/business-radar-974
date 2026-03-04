-- Migration 008 — Stocker la note globale Google directement sur businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;
