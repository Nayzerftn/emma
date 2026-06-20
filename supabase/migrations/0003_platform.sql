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
