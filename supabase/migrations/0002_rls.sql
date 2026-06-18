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
