/**
 * Accès centralisé et typé aux variables d'environnement.
 * Les valeurs `NEXT_PUBLIC_*` sont inlinées par Next (client + serveur).
 * Les secrets (service role, Stripe, Resend) ne sont lus que côté serveur.
 *
 * Tout est *guardé* : si une clé manque, l'app ne crash pas au build —
 * les fonctionnalités concernées sont simplement désactivées proprement.
 */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Natation Côte Basque <onboarding@resend.dev>",
  adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? "",
  // Jeton partagé pour l'ingestion Google Form (Apps Script → /api/intake/google-form).
  intakeToken: process.env.INTAKE_TOKEN ?? "",
  // Secret des tâches planifiées (Vercel Cron → /api/cron/*).
  cronSecret: process.env.CRON_SECRET ?? "",
  // WhatsApp Cloud API (Meta) — envoi/réception automatiques (optionnel).
  whatsappToken: process.env.WHATSAPP_TOKEN ?? "",
  whatsappPhoneId: process.env.WHATSAPP_PHONE_ID ?? "",
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
} as const;

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasSupabaseAdmin = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
export const hasStripe = Boolean(env.stripeSecretKey);
export const hasResend = Boolean(env.resendApiKey);
export const hasIntakeToken = Boolean(env.intakeToken);
export const hasWhatsapp = Boolean(env.whatsappToken && env.whatsappPhoneId);
