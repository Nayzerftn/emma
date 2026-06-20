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
