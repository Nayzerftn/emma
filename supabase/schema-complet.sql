-- ═══════════════════════════════════════════════════════════════
-- NATATION CÔTE BASQUE — SCHÉMA COMPLET (idempotent, rejouable)
-- À coller dans Supabase → SQL Editor. Ne touche pas aux données.
-- Ordre : schéma marketing → RLS/fonctions → plateforme → lien factures
-- ═══════════════════════════════════════════════════════════════

-- ╔═══ 1. SCHÉMA MARKETING (0001) ═══╗
-- ─────────────────────────────────────────────────────────────
-- Natation Côte Basque — schéma (idempotent).
-- Montants & prix en entiers (centimes).
-- ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- Membres de l'équipe
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text not null default '',
  role text not null default '',
  bio text not null default '',
  photo_path text,
  services text[] not null default '{}',
  whatsapp text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Créneaux bassin privé
create table if not exists public.pool_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  audience text not null check (audience in ('enfant', 'adulte')),
  level int check (level between 1 and 3),
  teacher_id uuid references public.team_members (id) on delete set null,
  capacity int not null default 1 check (capacity > 0),
  booked_count int not null default 0 check (booked_count >= 0),
  price_cents int not null check (price_cents >= 0),
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists pool_slots_starts_at_idx on public.pool_slots (starts_at);

-- Réservations bassin
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.pool_slots (id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  participant_name text not null,
  participant_age int,
  amount_cents int not null check (amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz not null default now()
);
create index if not exists bookings_slot_id_idx on public.bookings (slot_id);
create index if not exists bookings_status_idx on public.bookings (status);
create unique index if not exists bookings_stripe_session_uniq
  on public.bookings (stripe_session_id) where stripe_session_id is not null;

-- Leads (domicile + océan)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('domicile', 'ocean')),
  name text not null,
  email text not null,
  phone text not null,
  address text,
  city text,
  level text,
  availability text,
  group_size text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  assigned_teacher_id uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists leads_status_idx on public.leads (status);

-- Contenu éditable (CMS léger)
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  key text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  unique (page, key)
);

-- Témoignages
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  location text,
  context text,
  quote text not null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- FAQ
create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  question text not null,
  answer text not null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Allowlist admin (id = auth.users.id)
create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Idempotence webhook Stripe
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);


-- ╔═══ 2. RLS + FONCTIONS + STORAGE (0002) ═══╗
-- ─────────────────────────────────────────────────────────────
-- RLS + Storage. Le webhook Stripe et les écritures critiques passent
-- par la service role (qui contourne RLS). Idempotent.
-- ─────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

alter table public.team_members enable row level security;
alter table public.pool_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.leads enable row level security;
alter table public.content_blocks enable row level security;
alter table public.testimonials enable row level security;
alter table public.faq_items enable row level security;
alter table public.admins enable row level security;
alter table public.stripe_events enable row level security;

-- team_members : lecture publique des actives, gestion admin
drop policy if exists team_public_read on public.team_members;
create policy team_public_read on public.team_members for select using (is_active = true);
drop policy if exists team_admin_all on public.team_members;
create policy team_admin_all on public.team_members for all
  using (public.is_admin()) with check (public.is_admin());

-- pool_slots : lecture publique des créneaux ouverts & futurs, gestion admin
drop policy if exists slots_public_read on public.pool_slots;
create policy slots_public_read on public.pool_slots for select
  using (is_open = true and starts_at > now());
drop policy if exists slots_admin_all on public.pool_slots;
create policy slots_admin_all on public.pool_slots for all
  using (public.is_admin()) with check (public.is_admin());

-- bookings : aucune lecture publique (privacy), gestion admin.
-- Les insertions passent par la service role (Server Action) → bypass RLS.
drop policy if exists bookings_admin_all on public.bookings;
create policy bookings_admin_all on public.bookings for all
  using (public.is_admin()) with check (public.is_admin());

-- leads : insertion publique restreinte (status='new'), gestion admin, pas de lecture publique
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads for insert with check (status = 'new');
drop policy if exists leads_admin_all on public.leads;
create policy leads_admin_all on public.leads for all
  using (public.is_admin()) with check (public.is_admin());

-- content_blocks : lecture publique, écriture admin
drop policy if exists content_public_read on public.content_blocks;
create policy content_public_read on public.content_blocks for select using (true);
drop policy if exists content_admin_all on public.content_blocks;
create policy content_admin_all on public.content_blocks for all
  using (public.is_admin()) with check (public.is_admin());

-- testimonials : lecture publique des publiés, gestion admin
drop policy if exists testi_public_read on public.testimonials;
create policy testi_public_read on public.testimonials for select using (published = true);
drop policy if exists testi_admin_all on public.testimonials;
create policy testi_admin_all on public.testimonials for all
  using (public.is_admin()) with check (public.is_admin());

-- faq_items : lecture publique des publiés, gestion admin
drop policy if exists faq_public_read on public.faq_items;
create policy faq_public_read on public.faq_items for select using (published = true);
drop policy if exists faq_admin_all on public.faq_items;
create policy faq_admin_all on public.faq_items for all
  using (public.is_admin()) with check (public.is_admin());

-- admins : un utilisateur lit sa propre ligne (pour vérifier son statut)
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins for select using (id = auth.uid());
drop policy if exists admins_admin_all on public.admins;
create policy admins_admin_all on public.admins for all
  using (public.is_admin()) with check (public.is_admin());

-- stripe_events : lecture admin (écritures via service role)
drop policy if exists stripe_admin_read on public.stripe_events;
create policy stripe_admin_read on public.stripe_events for select using (public.is_admin());

-- ── Storage buckets (lecture publique) ────────────────────────
insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true), ('site-photos', 'site-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "ncb public read team-photos" on storage.objects;
create policy "ncb public read team-photos" on storage.objects for select
  using (bucket_id = 'team-photos');
drop policy if exists "ncb public read site-photos" on storage.objects;
create policy "ncb public read site-photos" on storage.objects for select
  using (bucket_id = 'site-photos');

drop policy if exists "ncb admin write team-photos" on storage.objects;
create policy "ncb admin write team-photos" on storage.objects for all
  using (bucket_id = 'team-photos' and public.is_admin())
  with check (bucket_id = 'team-photos' and public.is_admin());
drop policy if exists "ncb admin write site-photos" on storage.objects;
create policy "ncb admin write site-photos" on storage.objects for all
  using (bucket_id = 'site-photos' and public.is_admin())
  with check (bucket_id = 'site-photos' and public.is_admin());


-- ╔═══ 3. PLATEFORME OPÉRATIONNELLE (0003) ═══╗
-- ─────────────────────────────────────────────────────────────
-- Plateforme opérationnelle (domicile / océan) — brief technique v2.
-- Matching, planning, comptabilité. Tout en admin-only (back-office).
-- Idempotent.
-- ─────────────────────────────────────────────────────────────

-- Zones géographiques A→J (secteurs Côte Basque)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'ncb_zone') then
    create type ncb_zone as enum ('A','B','C','D','E','F','G','H','I','J');
  end if;
end $$;

-- Réglages professeure (privé : tarifs de paie, zones, dispos) — séparé de team_members (public)
create table if not exists public.teacher_settings (
  teacher_id uuid primary key references public.team_members (id) on delete cascade,
  zones text[] not null default '{}',
  max_per_day int not null default 6 check (max_per_day > 0),
  payout_30_cents int not null default 2500,
  payout_60_cents int not null default 4000,
  -- { "base": [{ "weekday": 1, "parts": ["morning","afternoon"] }], "exceptions": [{ "date": "2026-07-14", "off": true }] }
  availability jsonb not null default '{"base":[],"exceptions":[]}',
  updated_at timestamptz not null default now()
);

-- Clients (parents)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
create index if not exists clients_phone_idx on public.clients (phone);

-- Demandes de cours (domicile / océan) — site ou Google Form
create table if not exists public.lesson_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete set null,
  name text not null,
  email text,
  phone text,
  type text not null check (type in ('domicile', 'ocean')),
  zone text,
  address text,
  student_name text,
  student_age int,
  student_level text,
  objective text,
  weeks text,
  slots_wanted text,
  frequency text,
  duration_min int not null default 30 check (duration_min in (30, 60)),
  nb_courses int,
  preferred_teacher_id uuid references public.team_members (id) on delete set null,
  message text,
  source text not null default 'site' check (source in ('site', 'google_form', 'manual')),
  status text not null default 'new'
    check (status in ('new', 'matching', 'proposed', 'confirmed', 'to_retreat', 'lost')),
  matched_teacher_id uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists lesson_requests_status_idx on public.lesson_requests (status);

-- Cours planifiés
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.lesson_requests (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  teacher_id uuid not null references public.team_members (id) on delete restrict,
  student_name text,
  starts_at timestamptz not null,
  duration_min int not null check (duration_min in (30, 60)),
  zone text,
  address text,
  price_cents int not null,
  payout_cents int not null default 0,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'done', 'cancelled', 'cancelled_late')),
  created_at timestamptz not null default now()
);
create index if not exists lessons_teacher_idx on public.lessons (teacher_id, starts_at);
create index if not exists lessons_client_idx on public.lessons (client_id);

-- Factures familles
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete set null,
  client_name text not null,
  period_label text,
  lines jsonb not null default '[]',
  total_cents int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'late')),
  stripe_url text,
  created_at timestamptz not null default now()
);
create index if not exists invoices_client_idx on public.invoices (client_id);

-- ── RLS : tout en admin-only (back-office) ; écritures sensibles via service role ──
alter table public.teacher_settings enable row level security;
alter table public.clients enable row level security;
alter table public.lesson_requests enable row level security;
alter table public.lessons enable row level security;
alter table public.invoices enable row level security;

do $$
declare t text;
begin
  foreach t in array array['teacher_settings','clients','lesson_requests','lessons','invoices']
  loop
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format(
      'create policy %I_admin_all on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t, t
    );
  end loop;
end $$;


-- ╔═══ 4. LIEN COURS ↔ FACTURE / ANTI-DOUBLE-FACTURATION (0004) ═══╗
-- ─────────────────────────────────────────────────────────────
-- Lien cours ↔ facture : empêche la double-facturation.
-- Un cours facturé porte l'id de sa facture ; la génération de
-- facture n'agrège que les cours non encore facturés (invoice_id null).
-- À la suppression d'une facture, ses cours redeviennent facturables.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────
alter table public.lessons
  add column if not exists invoice_id uuid references public.invoices (id) on delete set null;

create index if not exists lessons_invoice_idx on public.lessons (invoice_id);


-- ╔═══ 5. HORODATAGE STATUT DEMANDE (alertes Eléa) ═══╗
-- ─────────────────────────────────────────────────────────────
-- Horodatage du dernier changement de statut d'une demande.
-- Sert aux alertes Eléa : « proposée mais client muet > 24h ».
-- Idempotent.
-- ─────────────────────────────────────────────────────────────
alter table public.lesson_requests
  add column if not exists status_changed_at timestamptz not null default now();
