-- =============================================================
-- Business Radar 974 — Schéma initial
-- =============================================================

-- ---------------------------------------------------------------
-- ORGANISATIONS (= clients payants)
-- ---------------------------------------------------------------
CREATE TABLE organizations (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,
  plan            TEXT        DEFAULT 'standard',
  api_key_claude  TEXT,       -- clé API Claude propre au client (optionnel)
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- PROFILS UTILISATEURS (liés à auth.users)
-- ---------------------------------------------------------------
CREATE TABLE profiles (
  id              UUID        REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID        REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT        DEFAULT 'member' CHECK (role IN ('superadmin', 'admin', 'member')),
  full_name       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Crée automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------
-- BUSINESSES (client ou concurrent)
-- ---------------------------------------------------------------
CREATE TABLE businesses (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id     UUID    REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name                TEXT    NOT NULL,
  google_place_id     TEXT,
  facebook_page_id    TEXT,
  instagram_username  TEXT,
  website_url         TEXT,
  is_competitor       BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- AVIS COLLECTÉS
-- ---------------------------------------------------------------
CREATE TABLE reviews (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id  UUID        REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  author_name  TEXT,
  rating       INTEGER     CHECK (rating BETWEEN 1 AND 5),
  text         TEXT,
  published_at TIMESTAMPTZ,
  source       TEXT        DEFAULT 'google' CHECK (source IN ('google', 'tripadvisor', 'facebook')),
  collected_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- POSTS RÉSEAUX SOCIAUX
-- ---------------------------------------------------------------
CREATE TABLE social_posts (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id  UUID        REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  platform     TEXT        NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  post_id      TEXT,
  content      TEXT,
  likes        INTEGER     DEFAULT 0,
  comments     INTEGER     DEFAULT 0,
  shares       INTEGER     DEFAULT 0,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- SNAPSHOTS SEO
-- ---------------------------------------------------------------
CREATE TABLE seo_snapshots (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id      UUID        REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  url              TEXT,
  status_code      INTEGER,
  load_time_ms     INTEGER,
  title            TEXT,
  meta_description TEXT,
  h1_count         INTEGER,
  has_ssl          BOOLEAN,
  mobile_friendly  BOOLEAN,
  lighthouse_score INTEGER     CHECK (lighthouse_score BETWEEN 0 AND 100),
  collected_at     TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- RAPPORTS AI
-- ---------------------------------------------------------------
CREATE TABLE ai_reports (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID        REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  report_type     TEXT        DEFAULT 'monthly' CHECK (report_type IN ('monthly', 'weekly', 'alert')),
  content         JSONB,
  summary         TEXT,
  recommendations JSONB,
  generated_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- Fonction utilitaire : récupère l'organization_id du user connecté
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fonction utilitaire : vérifie si le user est superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT role = 'superadmin' FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- organizations ---
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id() OR is_superadmin());

CREATE POLICY "Superadmin can manage organizations"
  ON organizations FOR ALL
  USING (is_superadmin());

-- --- profiles ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR organization_id = get_user_organization_id() OR is_superadmin());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- --- businesses ---
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org businesses"
  ON businesses FOR SELECT
  USING (organization_id = get_user_organization_id() OR is_superadmin());

CREATE POLICY "Admins manage own org businesses"
  ON businesses FOR ALL
  USING (organization_id = get_user_organization_id() OR is_superadmin());

-- --- reviews ---
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org reviews"
  ON reviews FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id = get_user_organization_id()
    ) OR is_superadmin()
  );

CREATE POLICY "Service role manages reviews"
  ON reviews FOR ALL
  USING (is_superadmin());

-- --- social_posts ---
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org social posts"
  ON social_posts FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id = get_user_organization_id()
    ) OR is_superadmin()
  );

-- --- seo_snapshots ---
ALTER TABLE seo_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org seo snapshots"
  ON seo_snapshots FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id = get_user_organization_id()
    ) OR is_superadmin()
  );

-- --- ai_reports ---
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org ai reports"
  ON ai_reports FOR SELECT
  USING (organization_id = get_user_organization_id() OR is_superadmin());

-- =============================================================
-- INDEX pour les performances
-- =============================================================
CREATE INDEX idx_businesses_org ON businesses(organization_id);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_published ON reviews(published_at DESC);
CREATE INDEX idx_social_posts_business ON social_posts(business_id);
CREATE INDEX idx_social_posts_published ON social_posts(published_at DESC);
CREATE INDEX idx_seo_snapshots_business ON seo_snapshots(business_id);
CREATE INDEX idx_seo_snapshots_collected ON seo_snapshots(collected_at DESC);
CREATE INDEX idx_ai_reports_org ON ai_reports(organization_id);
CREATE INDEX idx_ai_reports_generated ON ai_reports(generated_at DESC);
