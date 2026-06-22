-- ─────────────────────────────────────────────────────────────
-- Comptes professeures : lien team_member ↔ compte auth + email contact.
-- L'espace /prof résout la prof via auth_user_id et ne montre QUE ses cours.
-- RLS lessons reste admin-only ; l'espace /prof lit via service role côté
-- serveur, scopé au teacher_id de la session (cloisonnement garanti).
-- Idempotent.
-- ─────────────────────────────────────────────────────────────
alter table public.team_members
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;
alter table public.team_members
  add column if not exists email text;

create index if not exists team_members_auth_idx on public.team_members (auth_user_id);
