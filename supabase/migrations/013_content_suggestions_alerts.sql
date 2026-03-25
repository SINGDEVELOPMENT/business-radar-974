-- ═══════════════════════════════════════════════════════════════════
-- Migration 013 : Tables content_suggestions + alerts (Premium)
-- ═══════════════════════════════════════════════════════════════════

-- ── Suggestions de contenu IA ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  suggested_text TEXT NOT NULL,
  hashtags JSONB DEFAULT '[]'::jsonb,
  best_time TEXT,
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org suggestions"
  ON content_suggestions FOR SELECT
  USING (organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users update own org suggestions"
  ON content_suggestions FOR UPDATE
  USING (organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE INDEX idx_content_suggestions_org ON content_suggestions(organization_id);
CREATE INDEX idx_content_suggestions_biz ON content_suggestions(business_id);

-- ── Alertes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('negative_review', 'seo_drop', 'competitor_change')),
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org alerts"
  ON alerts FOR SELECT
  USING (organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users update own org alerts"
  ON alerts FOR UPDATE
  USING (organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE INDEX idx_alerts_org ON alerts(organization_id);
CREATE INDEX idx_alerts_unread ON alerts(organization_id, is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
