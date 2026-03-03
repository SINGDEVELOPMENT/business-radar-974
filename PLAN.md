# Business Radar 974 — Plan Technique Complet

## Vision Produit

**Business Radar 974** est un dashboard d'intelligence commerciale locale destiné aux entreprises réunionnaises. Tu déploies une instance multi-tenant qui agrège automatiquement les données publiques de chaque client (avis Google, réseaux sociaux, concurrents, SEO) et génère des analyses AI avec recommandations actionnables.

**Proposition de valeur** : "Votre tableau de bord intelligent qui surveille votre business et vos concurrents 24/7, avec des recommandations personnalisées chaque mois."

**Prix** : 1 000€+ setup one-shot + maintenance mensuelle (150-200€/mois)

---

## Stack Technique

| Couche | Techno | Justification |
|---|---|---|
| Framework | Next.js 14 (App Router) | Fullstack, SSR, API routes intégrées |
| Hébergement | Vercel | Déploiement simple, bon free tier |
| Base de données | Supabase (PostgreSQL) | Auth intégrée, realtime, bon free tier |
| Styling | Tailwind CSS + shadcn/ui | Rapide, composants pro |
| Graphiques | Recharts | Intégré React, simple |
| AI | API Claude (Anthropic) | Analyse et recommandations |
| Scraping | Cheerio + fetch (API routes) | Léger, pas de headless browser |
| CRON jobs | Vercel Cron Functions | Collecte automatique des données |
| Auth | Supabase Auth | Multi-tenant natif |

---

## Architecture Multi-Tenant

```
┌─────────────────────────────────────┐
│           VERCEL (Next.js)          │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │  Pages   │  │   API Routes     │  │
│  │ Dashboard│  │ /api/collect     │  │
│  │ Login    │  │ /api/analyze     │  │
│  │ Settings │  │ /api/competitors │  │
│  └─────────┘  └──────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐   │
│  │     Vercel CRON (daily)      │   │
│  │  → Collecte données clients  │   │
│  └──────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │
    ┌─────────▼─────────┐
    │     SUPABASE       │
    │                    │
    │  - users           │
    │  - organizations   │
    │  - businesses      │
    │  - reviews         │
    │  - social_posts    │
    │  - competitors     │
    │  - seo_snapshots   │
    │  - ai_reports      │
    │  - api_keys        │
    └────────────────────┘
```

### Modèle Multi-Tenant

- **Toi (admin)** : accès à tous les clients, tu configures chaque business
- **Client** : accès uniquement à son organisation et ses données
- Isolation par `organization_id` + Row Level Security (RLS) Supabase

---

## Schéma Base de Données (Supabase)

```sql
-- Organisations (= clients payants)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'standard',
  api_key_claude TEXT, -- clé API Claude du client
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Utilisateurs liés aux orgs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'member', -- 'admin' | 'member' | 'superadmin'
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
  website_url TEXT,
  is_competitor BOOLEAN DEFAULT false,
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
  source TEXT DEFAULT 'google', -- 'google' | 'tripadvisor' | 'facebook'
  collected_at TIMESTAMPTZ DEFAULT now()
);

-- Posts réseaux sociaux
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  platform TEXT NOT NULL, -- 'facebook' | 'instagram'
  post_id TEXT,
  content TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT now()
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
  collected_at TIMESTAMPTZ DEFAULT now()
);

-- Rapports AI générés
CREATE TABLE ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  report_type TEXT, -- 'monthly' | 'weekly' | 'alert'
  content JSONB, -- rapport structuré
  summary TEXT, -- résumé court
  recommendations JSONB, -- liste de recommandations
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS : chaque user ne voit que son org
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own org businesses"
  ON businesses FOR SELECT
  USING (organization_id = (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
  ));
-- (répéter pour chaque table)
```

---

## Structure de Fichiers (Next.js App Router)

```
business-radar-974/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout global + auth check
│   │   ├── page.tsx                # Landing / redirect
│   │   ├── login/
│   │   │   └── page.tsx            # Page de connexion
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Sidebar + nav dashboard
│   │   │   ├── page.tsx            # Vue d'ensemble (KPIs)
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx        # Avis Google détaillés
│   │   │   ├── social/
│   │   │   │   └── page.tsx        # Stats réseaux sociaux
│   │   │   ├── competitors/
│   │   │   │   └── page.tsx        # Comparaison concurrents
│   │   │   ├── seo/
│   │   │   │   └── page.tsx        # Audit SEO
│   │   │   ├── reports/
│   │   │   │   └── page.tsx        # Rapports AI
│   │   │   └── settings/
│   │   │       └── page.tsx        # Config business + API keys
│   │   └── api/
│   │       ├── collect/
│   │       │   ├── reviews/route.ts
│   │       │   ├── social/route.ts
│   │       │   ├── seo/route.ts
│   │       │   └── competitors/route.ts
│   │       ├── analyze/
│   │       │   └── route.ts        # Appel Claude pour analyse
│   │       ├── cron/
│   │       │   └── daily/route.ts  # CRON job quotidien
│   │       └── admin/
│   │           └── setup/route.ts  # Setup nouveau client
│   ├── components/
│   │   ├── ui/                     # shadcn components
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── ReviewsChart.tsx
│   │   │   ├── SocialMetrics.tsx
│   │   │   ├── CompetitorTable.tsx
│   │   │   ├── SeoScore.tsx
│   │   │   └── AiInsightCard.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── auth/
│   │       └── AuthGuard.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Client browser
│   │   │   ├── server.ts           # Client server-side
│   │   │   └── admin.ts            # Client admin (service role)
│   │   ├── collectors/
│   │   │   ├── google-reviews.ts   # Scraping/API avis Google
│   │   │   ├── facebook.ts         # API Graph Facebook
│   │   │   ├── instagram.ts        # Scraping/API Instagram
│   │   │   ├── seo-audit.ts        # Audit SEO basique
│   │   │   └── competitors.ts      # Recherche concurrents Google Maps
│   │   ├── ai/
│   │   │   ├── analyze.ts          # Prompt + appel Claude
│   │   │   └── prompts.ts          # Templates de prompts
│   │   └── utils/
│   │       ├── rate-limiter.ts
│   │       └── formatters.ts
│   └── types/
│       └── index.ts                # Types TypeScript
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── logo.svg
├── .env.local                      # Variables d'environnement
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Sources de Données — Stratégie de Collecte

### 1. Google Business Profile (Avis + Infos)
- **API** : Google Places API (nécessite une clé API)
- **Données** : Note moyenne, nombre d'avis, avis récents, horaires, photos
- **Alternative gratuite** : Scraping de la page Google Maps (plus fragile)
- **Fréquence** : 1x/jour
- **Coût estimé** : ~5-10€/mois par client

### 2. Facebook / Instagram
- **API** : Meta Graph API (nécessite un token d'accès page)
- **Données** : Posts récents, likes, commentaires, partages, reach
- **Setup** : Le client doit te donner accès à sa page (ou tu crées une app Meta)
- **Fréquence** : 1x/jour
- **Coût** : Gratuit (API Meta)

### 3. Google Maps — Concurrents
- **API** : Google Places Nearby Search
- **Données** : Concurrents dans un rayon, leurs notes, avis, catégories
- **Fréquence** : 1x/semaine
- **Coût** : Inclus dans la clé Google Places

### 4. Site Web du Client — SEO Basique
- **Méthode** : Fetch + parse HTML (pas besoin d'API)
- **Données** : Status code, temps de chargement, balises title/meta/H1, SSL, taille page
- **Bonus V2** : Intégrer Google PageSpeed Insights API (gratuit)
- **Fréquence** : 1x/jour
- **Coût** : Gratuit

---

## Analyse AI — Prompts Claude

### Prompt d'analyse mensuelle (exemple)

```typescript
const monthlyAnalysisPrompt = (data: BusinessData) => `
Tu es un consultant business expert du marché réunionnais (La Réunion, DOM-TOM).
Analyse les données suivantes pour l'entreprise "${data.businessName}"
et fournis un rapport structuré.

## Données collectées ce mois :

### Avis Google
- Note moyenne : ${data.avgRating}/5 (${data.totalReviews} avis)
- Évolution : ${data.ratingTrend}
- Derniers avis négatifs : ${JSON.stringify(data.negativeReviews)}

### Réseaux Sociaux
- Posts ce mois : ${data.postsCount}
- Engagement moyen : ${data.avgEngagement}%
- Meilleur post : ${data.bestPost}

### Concurrents
${data.competitors.map(c => `- ${c.name}: ${c.rating}/5 (${c.reviews} avis)`).join('\n')}

### SEO
- Score : ${data.seoScore}/100
- Problèmes détectés : ${data.seoIssues.join(', ')}

## Consignes :
1. Résume la situation en 3 phrases max
2. Identifie les 3 points forts
3. Identifie les 3 axes d'amélioration prioritaires
4. Donne 5 recommandations concrètes et actionnables
5. Compare avec les concurrents
6. Utilise un ton professionnel mais accessible

Réponds en JSON avec cette structure :
{
  "summary": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "recommendations": [
    { "priority": "haute", "action": "...", "impact": "..." }
  ],
  "competitor_analysis": "...",
  "score_global": 0-100
}
`;
```

---

## Planning MVP — 10 Jours

### Semaine 1 : Fondations

| Jour | Tâches | Livrable |
|------|--------|----------|
| J1 | Init Next.js + Supabase + Auth + schéma BDD | Projet qui tourne, login fonctionnel |
| J2 | Layout dashboard (Sidebar, Header, KpiCards) | UI de base navigable |
| J3 | Collecteur Google Reviews + stockage BDD | Avis récupérés et affichés |
| J4 | Collecteur SEO basique + page SEO | Audit SEO affiché |
| J5 | Collecteur Facebook/Instagram + page Social | Stats sociales affichées |

### Semaine 2 : Intelligence + Polish

| Jour | Tâches | Livrable |
|------|--------|----------|
| J6 | Page concurrents + collecteur Google Maps | Comparaison concurrents |
| J7 | Intégration Claude AI + page rapports | Rapports AI générés |
| J8 | CRON jobs Vercel + collecte automatique | Données auto-collectées chaque jour |
| J9 | Admin panel (ajouter client/business) | Tu peux onboarder un client |
| J10 | Polish UI + tests + déploiement Vercel | MVP en production |

---

## Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Google
GOOGLE_PLACES_API_KEY=xxx

# Meta (Facebook/Instagram)
META_APP_ID=xxx
META_APP_SECRET=xxx

# Claude AI (clé par défaut, overridée par client)
ANTHROPIC_API_KEY=xxx

# CRON secret
CRON_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://business-radar-974.vercel.app
```

---

## Modèle Économique Détaillé

### Ce que tu factures

| Prestation | Prix |
|---|---|
| Setup initial (config + déploiement + formation) | 1 000 — 1 500€ |
| Maintenance mensuelle (support + mises à jour) | 150 — 200€/mois |
| Ajout concurrent supplémentaire (>3) | 50€/concurrent |
| Rapport AI personnalisé ponctuel | 100€/rapport |

### Ce que le client paie directement
| Service | Coût estimé |
|---|---|
| API Google Places | ~10-20€/mois |
| API Claude (Anthropic) | ~5-15€/mois |
| Supabase (si dépasse free tier) | 25€/mois |

### Projection revenus
- 5 clients = 5 000-7 500€ setup + 750-1 000€/mois récurrent
- 10 clients = 10 000-15 000€ setup + 1 500-2 000€/mois récurrent

---

## Commandes Claude Code pour Démarrer

```bash
# Jour 1 — Init du projet
npx create-next-app@latest business-radar-974 --typescript --tailwind --eslint --app --src-dir
cd business-radar-974
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr recharts @anthropic-ai/sdk cheerio

# Init Supabase
npx supabase init
npx supabase db push
```

---

## Prompt Initial pour Claude Code

Copie ce prompt quand tu lances Claude Code sur le projet :

> Tu travailles sur "Business Radar 974", un dashboard d'intelligence commerciale
> pour les entreprises réunionnaises. Stack : Next.js 14 App Router + Supabase +
> Tailwind + shadcn/ui + Recharts + API Claude.
>
> Architecture multi-tenant : chaque client (organization) a ses propres businesses,
> reviews, social_posts, seo_snapshots. RLS Supabase pour l'isolation.
>
> Réfère-toi au fichier PLAN.md à la racine du projet pour l'architecture complète,
> le schéma BDD, et la structure de fichiers.
>
> Commence par [TÂCHE DU JOUR].

---

## Notes Importantes

1. **Google Places API** : Nécessite un compte Google Cloud avec facturation activée. Le free tier couvre ~$200/mois de requêtes.
2. **Meta Graph API** : Nécessite de créer une app Meta et que le client t'autorise l'accès à sa page. Process un peu lourd mais faisable.
3. **Scraping** : Pour les données qu'on ne peut pas avoir via API (ex: certains avis), prévoir du scraping léger mais attention à la fragilité.
4. **RGPD** : Les avis Google sont publics, mais les données sociales nécessitent le consentement du client. Prévoir un formulaire d'autorisation.
5. **Rate Limiting** : Implémenter des limites pour ne pas exploser les quotas API.
