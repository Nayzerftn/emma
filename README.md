# Natation Côte Basque

Site éditorial premium pour le collectif de maîtres-nageuses de la Côte Basque.
**Next.js 16** (App Router, Server Components, Server Actions) · TypeScript strict ·
Tailwind v4 · Supabase (Postgres/Auth/Storage/RLS) · Stripe Checkout + webhook ·
Motion + Lenis · React Hook Form + Zod · Vitest + Playwright.

> ⚠️ Cette version de Next.js a des conventions spécifiques (voir `AGENTS.md`) :
> `cookies`/`headers`/`params`/`searchParams` **async**, `middleware.ts` → **`proxy.ts`** (runtime Node),
> Turbopack par défaut, `next lint` supprimé. La référence est `node_modules/next/dist/docs/`.

## Démarrage

```bash
pnpm install
cp .env.example .env.local   # puis remplir les clés
pnpm dev                     # http://localhost:3000
```

## Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` / `pnpm start` | Build de production / serveur |
| `pnpm typecheck` | `tsc --noEmit` (strict) |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:e2e` | Tests e2e (Playwright) |
| `pnpm db:setup` | Applique migrations + RLS + seed sur Supabase |
| `pnpm db:check` | Vérifie la RLS comme utilisateur anonyme |

## Base de données (Supabase)

Le schéma, la RLS et le seed sont versionnés dans `supabase/`.

1. Renseigner dans `.env.local` soit `SUPABASE_DB_URL` (URI complète : Supabase →
   Settings → Database → Connection string → **URI**), soit `SUPABASE_DB_PASSWORD`.
2. Appliquer :
   ```bash
   pnpm db:setup     # 0001_schema.sql + 0002_rls.sql + seed.sql
   pnpm db:check     # contrôle RLS (lectures publiques OK, écritures anon refusées)
   ```
   Le seed installe les 8 expertes, 3 témoignages, la FAQ, des `content_blocks`
   éditables et des créneaux bassin de démonstration (week-ends à venir).

### Créer un compte admin

1. Dans Supabase → Authentication → Add user : créer l'utilisateur (email + mot de passe).
2. Récupérer son `id` (UUID) puis l'ajouter à l'allowlist admin (SQL Editor) :
   ```sql
   insert into public.admins (id, email)
   values ('<auth-user-uuid>', 'contact@nayzerapp.com');
   ```
3. Connexion sur `/admin/login`. Tout `/admin` est protégé par `src/proxy.ts`
   + vérification `admins` côté serveur.

## Stripe (mode test)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copier le `whsec_...` affiché dans STRIPE_WEBHOOK_SECRET (.env.local), puis relancer pnpm dev.
```

Tunnel de réservation bassin sur `/reservation#bassin` → Stripe Checkout
(carte test `4242 4242 4242 4242`). Le webhook marque la réservation `paid`,
incrémente la capacité et envoie les emails. Idempotent (table `stripe_events`).

## Emails (Resend)

Optionnel en dev (sans clé, les envois sont des **no-op loggés**). En prod :
`RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`.

## Photos

Déposer les fichiers dans `/public/photos` (voir `PHOTOS.md` pour les noms exacts).
Tant qu'un fichier manque, un placeholder propre s'affiche (swap instantané).

## Tests

```bash
pnpm test                    # unitaires : pricing, availability, webhook, Zod, composants
npx playwright install       # 1re fois : navigateurs
pnpm test:e2e                # navigation 8 pages, lead, réservation → Stripe
```

## Déploiement (Vercel)

1. Importer le repo, définir toutes les variables de `.env.example` (Production).
2. Ajouter un endpoint webhook Stripe prod (`https://<domaine>/api/webhooks/stripe`)
   et renseigner son `whsec_` de production.
3. Brancher Resend (clé + domaine vérifié) et passer Stripe en mode live.
4. `NEXT_PUBLIC_SITE_URL` = domaine de production.

## Architecture

```
src/app/(site)      → 8 pages publiques + success/cancel  (statique / ISR)
src/app/(admin)     → back-office protégé (login + 7 sections)
src/app/api/...     → webhook Stripe
src/proxy.ts        → garde d'accès /admin (Node)
src/components/{site,admin,ui,motion}
src/lib/            → constants, content (Annexe A), supabase, stripe, pricing,
                      availability, validation (Zod), seo, photos, email
src/actions/        → Server Actions (leads, bookings, admin)
supabase/           → migrations + RLS + seed
tests/{unit,e2e}
```
