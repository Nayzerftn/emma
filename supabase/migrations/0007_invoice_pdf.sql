-- ─────────────────────────────────────────────────────────────
-- Facture PDF via Stripe Invoices : URL du PDF + id facture Stripe.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────
alter table public.invoices add column if not exists pdf_url text;
alter table public.invoices add column if not exists stripe_invoice_id text;
