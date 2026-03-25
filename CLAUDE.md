# CLAUDE.md — Mémoire Projet : Business Radar 974

Ce fichier est la référence principale pour Claude Code sur ce projet.
Lis-le en entier avant de coder quoi que ce soit.

---

## Vision Produit

**Business Radar 974** est un dashboard d'intelligence commerciale locale destiné aux **entreprises réunionnaises**. La plateforme agrège automatiquement les données publiques de chaque client (avis Google, réseaux sociaux, concurrents, SEO) et génère des analyses AI avec recommandations actionnables.

**Proposition de valeur** : "Votre tableau de bord intelligent qui surveille votre business et vos concurrents 24/7, avec des recommandations personnalisées chaque mois."

**Modèle économique** :
- Setup one-shot : 1 000 — 1 500 €
- Maintenance mensuelle : 150 — 200 €/mois
- Le client paie ses propres API (Google Places ~10-20€/mois, Claude ~5-15€/mois)

---

## Stack Technique

| Couche       | Technologie                   | Rôle                                      |
|--------------|-------------------------------|-------------------------------------------|
| Framework    | Next.js 14 (App Router)       | Fullstack, SSR, API routes intégrées      |
| Hébergement  | Vercel                        | Déploiement, Cron Functions               |
| Base de données | Supabase (PostgreSQL)      | Auth intégrée, RLS, realtime              |
| Styling      | Tailwind CSS + shadcn/ui      | UI cohérente et rapide                    |
| Graphiques   | Recharts                      | Charts React natifs                       |
| AI           | API Claude (Anthropic)        | Analyse et recommandations                |
| Scraping     | Cheerio + fetch               | Collecte légère sans headless browser     |
| CRON jobs    | Vercel Cron Functions         | Collecte automatique quotidienne          |
| Auth         | Supabase Auth                 | Multi-tenant natif                        |

**Packages NPM à installer** :
```bash
npm install @supabase/supabase-js @supabase/ssr recharts @anthropic-ai/sdk cheerio
```

---

## Architecture Multi-Tenant

### Principe d'isolation

- **Superadmin (toi)** : accès à toutes les organisations, configure chaque business
- **Client** : accès uniquement à son organisation et ses données
- Isolation via `organization_id` présent sur toutes les tables + **Row Level Security (RLS) Supabase**

### Flux de données

```
Vercel (Next.js)
├── Pages (Dashboard, Login, Settings)
├── API Routes
│   ├── /api/collect/reviews
│   ├── /api/collect/social
│   ├── /api/collect/seo
│   ├── /api/collect/competitors
│   ├── /api/analyze          ← Appel Claude AI
│   ├── /api/cron/daily       ← CRON Vercel
│   └── /api/admin/setup      ← Onboarding client
└── Vercel Cron (daily)
        │
        ▼
    Supabase (PostgreSQL + Auth)
```

### Tables et relations

```
auth.users
    └── profiles (id, organization_id, role)
            └── organizations (id, name, slug, plan, api_key_claude)
                    └── businesses (id, organization_id, google_place_id, ...)
                            ├── reviews (business_id, rating, text, source)
                            ├── social_posts (business_id, platform, likes, ...)
                            └── seo_snapshots (business_id, url, lighthouse_score, ...)
organizations
    └── ai_reports (organization_id, report_type, content JSONB, recommendations JSONB)
```

**Rôles utilisateur** : `superadmin` | `admin` | `member`

**RLS** : Chaque table métier a une policy `USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))`. À répliquer sur chaque table.

---

## Distinction Standard vs Premium

| Fonctionnalité | Standard | Premium |
|---------------|----------|---------|
| Avis Google | ✅ | ✅ |
| Réseaux sociaux (FB + IG) | ✅ | ✅ |
| Concurrents | 2 max | 5 max |
| Audit SEO de base | ✅ | ✅ |
| SEO on-page complet | ❌ | ✅ |
| Core Web Vitals détaillés | ❌ | ✅ |
| Rapports AI | 1 mensuel | Hebdomadaires |
| Rapports manuels | ❌ | 5/mois |
| Suggestions contenu IA | ❌ | ✅ |
| Alertes prioritaires | ❌ | ✅ |
| Export PDF & Excel | ❌ | ✅ |
| % réponses avis concurrents | ❌ | ✅ |
| Avis récents 30j concurrents | ❌ | ✅ |
| PageSpeed concurrents | ❌ | ✅ |

---

## Schéma Base de Données (référence rapide)

```sql
-- organisations
organizations(id, name, slug, plan, api_key_claude, created_at)

-- utilisateurs
profiles(id → auth.users, organization_id, role, full_name, created_at)

-- business surveillé (client ou concurrent)
businesses(id, organization_id, name, google_place_id, facebook_page_id,
           instagram_username, website_url, is_competitor, created_at)

-- avis collectés
reviews(id, business_id, author_name, rating, text, published_at,
        source [google|tripadvisor|facebook], collected_at)

-- posts réseaux sociaux
social_posts(id, business_id, platform [facebook|instagram], post_id,
             content, likes, comments, shares, published_at, collected_at)

-- audit SEO
seo_snapshots(id, business_id, url, status_code, load_time_ms, title,
              meta_description, h1_count, has_ssl, mobile_friendly,
              lighthouse_score, collected_at)

-- rapports AI
ai_reports(id, organization_id, report_type [monthly|weekly|alert],
           content JSONB, summary, recommendations JSONB, generated_at)

-- suggestions de contenu IA (Premium)
content_suggestions(id, business_id, organization_id, platform [facebook|instagram],
                    suggested_text, hashtags JSONB, best_time, reasoning,
                    status [pending|used|dismissed], generated_at)

-- alertes (Premium)
alerts(id, organization_id, business_id, type [negative_review|seo_drop|competitor_change],
       title, message, severity [low|medium|high], is_read, created_at)
```

---

## Structure de Fichiers

```
business-radar-974/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Layout global + auth check
│   │   ├── page.tsx                      # Landing / redirect
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Sidebar + nav
│   │   │   ├── page.tsx                  # Vue d'ensemble (KPIs)
│   │   │   ├── reviews/page.tsx          # Avis Google détaillés
│   │   │   ├── social/page.tsx           # Stats réseaux sociaux
│   │   │   ├── competitors/page.tsx      # Comparaison concurrents
│   │   │   ├── seo/page.tsx              # Audit SEO
│   │   │   ├── reports/page.tsx          # Rapports AI
│   │   │   ├── suggestions/page.tsx     # Suggestions contenu IA (Premium)
│   │   │   ├── alerts/page.tsx          # Alertes prioritaires (Premium)
│   │   │   └── settings/page.tsx         # Config business + clés API
│   │   └── api/
│   │       ├── collect/
│   │       │   ├── reviews/route.ts      # + création alertes avis négatifs
│   │       │   ├── social/route.ts
│   │       │   ├── seo/route.ts
│   │       │   └── competitors/route.ts
│   │       ├── suggestions/
│   │       │   ├── route.ts              # GET suggestions, PATCH status
│   │       │   └── generate/route.ts     # POST génération IA (Premium)
│   │       ├── alerts/route.ts           # GET alertes, PATCH marquer lu
│   │       ├── analyze/route.ts          # Appel Claude
│   │       ├── export/xlsx/route.ts      # Export Excel (Premium)
│   │       ├── reports/pdf/route.ts      # Export PDF (Premium)
│   │       ├── cron/daily/route.ts       # CRON quotidien + hebdo Premium
│   │       └── admin/setup/route.ts      # Onboarding client
│   ├── components/
│   │   ├── ui/                           # Composants shadcn/ui (auto-générés)
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
│   │   │   ├── client.ts                 # Client browser (createBrowserClient)
│   │   │   ├── server.ts                 # Client server-side (createServerClient)
│   │   │   └── admin.ts                  # Client service role (bypass RLS)
│   │   ├── collectors/
│   │   │   ├── google-reviews.ts         # Google Places API
│   │   │   ├── facebook.ts               # Meta Graph API
│   │   │   ├── instagram.ts              # Meta Graph API
│   │   │   ├── seo-audit.ts              # Fetch + parse HTML
│   │   │   └── competitors.ts            # Google Places Nearby Search
│   │   ├── ai/
│   │   │   ├── analyze.ts                # Appel Claude avec données
│   │   │   └── prompts.ts                # Templates de prompts
│   │   └── utils/
│   │       ├── rate-limiter.ts
│   │       └── formatters.ts
│   └── types/
│       └── index.ts                      # Types TypeScript globaux
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── logo.svg
├── .env.local
├── vercel.json                           # Config cron jobs
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Conventions de Code

### Général

- **TypeScript strict** partout — pas de `any` sans justification
- **App Router** uniquement — pas de `pages/`
- Imports absolus depuis `@/` (alias `src/`)
- Un fichier = une responsabilité claire

### Composants React

- Composants en **PascalCase** : `KpiCard.tsx`, `ReviewsChart.tsx`
- Props typées avec une interface locale : `interface KpiCardProps { ... }`
- Server Components par défaut ; `'use client'` uniquement si nécessaire (hooks, events)
- Pas de logique métier dans les composants — déléguer à `lib/`

### API Routes (Next.js)

```typescript
// Pattern standard pour une API route
export async function GET(request: Request) {
  const supabase = createServerClient()  // depuis lib/supabase/server.ts
  // Vérification auth obligatoire
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  // ... logique métier
}
```

- Toujours vérifier l'auth en premier
- Retourner `Response.json()` ou `new Response()`
- Protéger le CRON `/api/cron/daily` avec le header `Authorization: Bearer CRON_SECRET`

### Supabase / Base de données

- Utiliser `lib/supabase/client.ts` dans les Client Components
- Utiliser `lib/supabase/server.ts` dans les Server Components et API routes
- Utiliser `lib/supabase/admin.ts` **uniquement** dans `/api/admin/` (bypass RLS)
- Toujours filtrer par `organization_id` en plus du RLS (défense en profondeur)
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client

### Nommage BDD

- Tables en `snake_case` pluriel : `ai_reports`, `seo_snapshots`
- Colonnes en `snake_case` : `organization_id`, `collected_at`
- Toujours inclure `id UUID DEFAULT gen_random_uuid()` et `created_at TIMESTAMPTZ DEFAULT now()`

### Collecteurs de données (`lib/collectors/`)

- Chaque collecteur exporte une fonction async principale : `collectGoogleReviews(businessId, placeId)`
- Gérer les erreurs sans faire planter le CRON (try/catch + log)
- Respecter les rate limits API — utiliser `lib/utils/rate-limiter.ts`
- Stocker le résultat brut en BDD, pas de transformation complexe dans le collecteur

### Analyse AI (`lib/ai/`)

- Les prompts sont dans `prompts.ts`, la logique d'appel dans `analyze.ts`
- Utiliser la clé API du client si disponible (`organizations.api_key_claude`), sinon la clé par défaut
- Toujours demander une réponse JSON structurée à Claude
- Valider le JSON retourné avant de le stocker

---

## Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx          # Ne jamais exposer côté client

# Google
GOOGLE_PLACES_API_KEY=xxx

# Meta (Facebook/Instagram)
META_APP_ID=xxx
META_APP_SECRET=xxx

# Claude AI (clé par défaut, overridée par client via organizations.api_key_claude)
ANTHROPIC_API_KEY=xxx

# CRON protection
CRON_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://business-radar-974.vercel.app
```

---

## Commandes Utiles

### Initialisation du projet (Jour 1)

```bash
npx create-next-app@latest business-radar-974 --typescript --tailwind --eslint --app --src-dir
cd business-radar-974
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr recharts @anthropic-ai/sdk cheerio
```

### Supabase

```bash
npx supabase init                  # Init config locale
npx supabase start                 # Démarre Supabase local (Docker)
npx supabase db push               # Pousse les migrations vers le projet remote
npx supabase db pull               # Pull le schéma depuis remote
npx supabase gen types typescript --local > src/types/supabase.ts  # Génère les types
```

### Développement

```bash
npm run dev                        # Serveur de développement (localhost:3000)
npm run build                      # Build de production
npm run lint                       # ESLint
```

### shadcn/ui — Ajouter des composants

```bash
npx shadcn@latest add button card badge table tabs chart
```

### Git

```bash
git add -p                         # Staging interactif
git commit -m "feat: ..."          # Conventional commits
git push -u origin <branch>
```

---

## Stratégie de Collecte des Données

| Source              | Méthode                     | Fréquence  | Coût estimé          |
|---------------------|-----------------------------|------------|----------------------|
| Google Reviews      | Google Places API           | 1x/jour    | ~5-10€/mois          |
| Facebook/Instagram  | Meta Graph API              | 1x/jour    | Gratuit              |
| Concurrents         | Google Places Nearby Search | 1x/semaine | Inclus Places API    |
| SEO                 | Fetch + parse HTML          | 1x/jour    | Gratuit              |
| SEO avancé (V2)     | Google PageSpeed Insights   | 1x/jour    | Gratuit              |

**Points de vigilance** :
- Google Places nécessite un compte Google Cloud avec facturation activée
- Meta Graph API nécessite que le client autorise l'accès à sa page
- Le scraping direct (fallback) est fragile — préférer les APIs officielles
- RGPD : données sociales nécessitent le consentement client (prévoir un formulaire)

---

## Prompt AI — Structure de référence

Le prompt mensuel envoie à Claude les données agrégées et attend ce JSON :

```json
{
  "summary": "Résumé en 3 phrases max",
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "weaknesses": ["axe 1", "axe 2", "axe 3"],
  "recommendations": [
    { "priority": "haute", "action": "...", "impact": "..." }
  ],
  "competitor_analysis": "Comparaison narrative avec les concurrents",
  "score_global": 72
}
```

Claude est positionné comme **consultant business expert du marché réunionnais**.
Toujours préciser le contexte local (La Réunion, DOM-TOM) dans les prompts.

---

## Planning MVP (10 jours)

| Jour | Focus                          | Livrable attendu                        |
|------|--------------------------------|-----------------------------------------|
| J1   | Init + Auth + Schéma BDD       | Projet qui tourne, login fonctionnel    |
| J2   | Layout Dashboard               | UI navigable (Sidebar, Header, KPIs)    |
| J3   | Collecteur Google Reviews      | Avis affichés en BDD                    |
| J4   | Collecteur SEO + page SEO      | Audit SEO affiché                       |
| J5   | Collecteur Social + page       | Stats Facebook/Instagram affichées      |
| J6   | Page Concurrents + collecteur  | Comparaison concurrents                 |
| J7   | Intégration Claude AI          | Rapports AI générés                     |
| J8   | CRON jobs Vercel               | Collecte automatique quotidienne        |
| J9   | Admin panel (onboarding)       | Ajout client fonctionnel                |
| J10  | Polish + tests + déploiement   | MVP en production sur Vercel            |
