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
