-- ─────────────────────────────────────────────────────────────
-- Horodatage du dernier changement de statut d'une demande.
-- Sert aux alertes Eléa : « proposée mais client muet > 24h ».
-- Idempotent.
-- ─────────────────────────────────────────────────────────────
alter table public.lesson_requests
  add column if not exists status_changed_at timestamptz not null default now();
