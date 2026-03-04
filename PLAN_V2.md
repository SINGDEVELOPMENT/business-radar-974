# Business Radar 974 — Plan Technique v2.0
> Mise à jour du 04/03/2026 — Suite au Jour 10/10 initial

---

## Vision Produit

**Business Radar 974** est un dashboard d'intelligence commerciale locale destiné aux entreprises réunionnaises. Laurent (SING Development) déploie une instance multi-tenant, configure chaque client, et facture le service clé en main.

**Proposition de valeur** : "Votre tableau de bord intelligent qui surveille votre business et vos concurrents 24/7, avec des recommandations personnalisées chaque mois."

**Prix** : 1 000 – 1 500 € setup one-shot + 150 – 200 €/mois maintenance

---

## Stack Technique

| Couche | Techno | Justification |
|---|---|---|
| Framework | Next.js 14 (App Router) | Fullstack, SSR, API routes intégrées |
| Hébergement | Vercel | Déploiement simple, CRON natif |
| Base de données | Supabase (PostgreSQL) | Auth intégrée, RLS, realtime |
| Styling | Tailwind CSS + shadcn/ui | Composants pro, dark mode |
| Graphiques | Recharts | Intégré React |
| AI | API Claude (Anthropic) | Analyse et recommandations |
| Scraping | Cheerio + fetch | Léger, pas de headless browser |
| CRON jobs | Vercel Cron Functions | Collecte automatique quotidienne |
| Auth | Supabase Auth | Multi-tenant natif |
| PDF | jsPDF | Export rapports |
| Email | Supabase Auth (invitations) | Onboarding clients |

---

## Architecture Multi-Tenant

```
┌─────────────────────────────────────┐
│           VERCEL (Next.js)          │
│  ┌─────────┐  ┌──────────────────┐  │
│  │  Pages   │  │   API Routes     │  │
│  │ Dashboard│  │ /api/collect     │  │
│  │ Login    │  │ /api/analyze     │  │
│  │ Settings │  │ /api/reports/pdf │  │
│  └─────────┘  └──────────────────┘  │
│  ┌──────────────────────────────┐   │
│  │     Vercel CRON (daily 6h)   │   │
│  └──────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │
    ┌─────────▼─────────┐
    │     SUPABASE       │
    │  organizations     │
    │  profiles          │
    │  businesses        │
    │  reviews           │
    │  social_posts      │
    │  seo_snapshots     │
    │  ai_reports        │
    └────────────────────┘
```

**Rôles :**
- **superadmin (toi)** : accès total, onboarde les clients, gère tout
- **admin** : accès à son organisation uniquement
- **member** : lecture seule sur son organisation

---

## Schéma Base de Données — État actuel (v2)

```sql
-- Organisations (= clients payants)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'standard',
  api_key_claude TEXT,
  meta_access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Utilisateurs liés aux orgs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'member',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Business surveillés
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  google_place_id TEXT,
  facebook_page_id TEXT,
  instagram_username TEXT,
  instagram_business_id TEXT,
  website_url TEXT,
  lat NUMERIC,
  lng NUMERIC,
  is_competitor BOOLEAN DEFAULT false,
  custom_competitor BOOLEAN DEFAULT false,
  google_rating NUMERIC,
  google_reviews_count INTEGER,
  social_consent_given BOOLEAN DEFAULT false,
  social_consent_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Avis Google collectés
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  author_name TEXT,
  rating INTEGER,
  text TEXT,
  published_at TIMESTAMPTZ,
  source TEXT DEFAULT 'google',
  collected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, author_name, published_at)
);

-- Posts réseaux sociaux
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  platform TEXT NOT NULL,
  post_id TEXT,
  content TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, post_id)
);

-- Snapshots SEO
CREATE TABLE seo_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  url TEXT,
  status_code INTEGER,
  load_time_ms INTEGER,
  title TEXT,
  meta_description TEXT,
  h1_count INTEGER,
  has_ssl BOOLEAN,
  mobile_friendly BOOLEAN,
  lighthouse_score INTEGER,
  page_size_kb INTEGER,
  collected_at TIMESTAMPTZ DEFAULT now()
);

-- Rapports AI générés
CREATE TABLE ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  report_type TEXT DEFAULT 'monthly',
  content JSONB,
  summary TEXT,
  recommendations JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Structure de Fichiers — État actuel (v2)

```
business-radar-974/
├── src/
│   ├── middleware.ts                    # ⚠️ DOIT être middleware.ts (pas proxy.ts)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 # KPIs + tendances (v2)
│   │   │   ├── admin/page.tsx           # Superadmin uniquement
│   │   │   ├── reviews/page.tsx         # Avis + filtres (v2)
│   │   │   ├── social/page.tsx
│   │   │   ├── competitors/page.tsx
│   │   │   ├── seo/page.tsx
│   │   │   ├── reports/page.tsx         # + export PDF (v2)
│   │   │   └── settings/page.tsx        # + trigger collecte (v2)
│   │   └── api/
│   │       ├── collect/
│   │       │   ├── reviews/route.ts
│   │       │   ├── seo/route.ts
│   │       │   ├── social/route.ts
│   │       │   ├── social/facebook/route.ts
│   │       │   ├── social/instagram/route.ts
│   │       │   ├── competitors/route.ts
│   │       │   └── manual/route.ts      # NOUVEAU v2 — trigger client
│   │       ├── analyze/route.ts
│   │       ├── competitors/route.ts
│   │       ├── reports/
│   │       │   └── pdf/route.ts         # NOUVEAU v2 — export PDF
│   │       ├── cron/daily/route.ts
│   │       ├── admin/
│   │       │   ├── setup/route.ts       # + envoi email invitation (v2)
│   │       │   ├── client/route.ts
│   │       │   ├── competitor/route.ts
│   │       │   └── trigger-cron/route.ts
│   │       └── settings/
│   │           ├── competitor/route.ts
│   │           └── consent/route.ts
│   ├── components/
│   │   ├── ui/                          # shadcn components
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx              # + prop trend (v2)
│   │   │   ├── OnboardingBanner.tsx     # NOUVEAU v2
│   │   │   ├── ReviewsChart.tsx
│   │   │   ├── SocialEngagementChart.tsx
│   │   │   ├── CompetitorChart.tsx
│   │   │   ├── CompetitorsPageClient.tsx # + limite visible (v2)
│   │   │   ├── CompetitorsManager.tsx
│   │   │   ├── CustomCompetitorsCard.tsx
│   │   │   ├── AiInsightCard.tsx
│   │   │   ├── GenerateReportButton.tsx
│   │   │   ├── AdminNewClientForm.tsx   # + guide IG Business ID (v2)
│   │   │   ├── AdminEditClientForm.tsx  # + guide IG Business ID (v2)
│   │   │   ├── AdminCompetitorsManager.tsx
│   │   │   ├── AdminTriggerButton.tsx
│   │   │   ├── RgpdConsentCard.tsx
│   │   │   ├── ChangePasswordCard.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # Bell → badge notifications (v2)
│   │   │   ├── Header.tsx
│   │   │   └── HeaderUserMenu.tsx
│   │   └── auth/
│   │       └── AuthGuard.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── collectors/
│   │   │   ├── google-reviews.ts
│   │   │   ├── facebook.ts
│   │   │   ├── instagram.ts
│   │   │   ├── seo-audit.ts
│   │   │   └── competitors.ts
│   │   ├── ai/
│   │   │   ├── analyze.ts
│   │   │   └── prompts.ts
│   │   └── utils/
│   │       ├── rate-limiter.ts
│   │       ├── formatters.ts
│   │       ├── seo.ts
│   │       └── index.ts
│   └── types/
│       └── index.ts
├── supabase/migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_consolidated.sql             # Remplace les 3 fichiers 002_*
│   ├── 003_social_consent.sql
│   └── 004_custom_competitors.sql
├── .env.local
├── next.config.ts
├── vercel.json
├── PLAN.md
└── CLAUDE.md
```

---

## Variables d'Environnement — Complètes

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Google
GOOGLE_PLACES_API_KEY=xxx   # Places API + PageSpeed API (même clé)

# Meta (Facebook/Instagram)
META_APP_ID=xxx
META_APP_SECRET=xxx
# Note : le META_ACCESS_TOKEN est stocké par ORGANISATION dans la table organizations

# Claude AI
ANTHROPIC_API_KEY=xxx   # Clé par défaut, overridée par api_key_claude de l'org

# CRON
CRON_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://business-radar-974.vercel.app
```

---

## CRON Jobs Vercel

```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Ce que fait le CRON :**
- Tous les jours à 6h UTC : collecte reviews + SEO + social pour chaque business actif
- Tous les dimanches : refresh notes/avis des concurrents custom

---

## Guide — Obtenir l'Instagram Business ID

Pour chaque client Instagram :

1. Aller sur https://developers.facebook.com/tools/explorer
2. Sélectionner l'app Meta créée
3. Générer un token avec les permissions `instagram_basic` + `pages_show_list`
4. Appeler : `GET /{page-id}?fields=instagram_business_account`
5. L'id retourné est l'`instagram_business_id` à entrer dans le formulaire admin

---

## Guide — Obtenir un Google Place ID

1. Aller sur https://developers.google.com/maps/documentation/places/web-service/place-id
2. Chercher le nom de l'entreprise sur la carte
3. Cliquer sur la fiche → l'URL contient le `place_id`
4. Alternative : utiliser https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=NOM&inputtype=textquery&key=API_KEY

---

## Planning Upgrade — Sprints v2

### Sprint 1 — Corrections critiques (1-2 jours)
| Tâche | Fichier | Priorité |
|---|---|---|
| Renommer proxy.ts → middleware.ts | `src/middleware.ts` | 🔴 Critique |
| Consolider migrations 002_* | `supabase/migrations/` | 🔴 Critique |
| Guide Instagram Business ID dans les forms | `AdminNewClientForm.tsx`, `AdminEditClientForm.tsx` | 🟠 Haute |

### Sprint 2 — Features manquantes (3-4 jours)
| Tâche | Fichier | Priorité |
|---|---|---|
| Email invitation client (supabase.auth.admin.inviteUserByEmail) | `api/admin/setup/route.ts` | 🟠 Haute |
| Export PDF rapport AI (jsPDF) | `api/reports/pdf/route.ts` + UI | 🟠 Haute |
| Trigger collecte manuelle client (1x/24h) | `api/collect/manual/route.ts` + `settings/page.tsx` | 🟠 Haute |
| Tendances KPIs (delta vs mois précédent) | `dashboard/page.tsx`, `KpiCard.tsx` | 🟡 Moyenne |

### Sprint 3 — Polish UX (2-3 jours)
| Tâche | Fichier | Priorité |
|---|---|---|
| OnboardingBanner (premier login sans données) | `OnboardingBanner.tsx` | 🟡 Moyenne |
| Filtres avis par étoile + lien réponse Google | `dashboard/reviews/page.tsx` | 🟡 Moyenne |
| Badge notifications Bell OU suppression | `Sidebar.tsx` | 🟡 Moyenne |
| Affichage limite concurrents | `CompetitorsPageClient.tsx` | 🟡 Moyenne |

---

## Modèle Économique

| Prestation | Prix |
|---|---|
| Setup initial | 1 000 – 1 500 € |
| Maintenance mensuelle | 150 – 200 €/mois |
| Concurrent supplémentaire (>3) | 50 €/concurrent |
| Rapport AI ponctuel | 100 €/rapport |

**Projection :**
- 5 clients = 5 000 – 7 500 € setup + 750 – 1 000 €/mois
- 10 clients = 10 000 – 15 000 € setup + 1 500 – 2 000 €/mois

---

## Prompt Initial pour Claude Code (v2)

```
Tu travailles sur "Business Radar 974" v2, un dashboard d'intelligence commerciale 
pour les entreprises réunionnaises.

Stack : Next.js 14 App Router + Supabase + Tailwind + shadcn/ui + Recharts + API Claude.
Architecture multi-tenant : chaque client (organization) a ses propres données isolées par RLS.

IMPORTANT : 
- Le middleware Next.js doit être dans src/middleware.ts (pas proxy.ts)
- Les migrations Supabase sont dans supabase/migrations/
- Conventions de code dans CLAUDE.md

Réfère-toi au fichier PLAN.md à la racine pour l'architecture complète.

Commence par [TÂCHE DU SPRINT].
```
