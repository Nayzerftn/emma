/**
 * Accès centralisé et typé aux variables d'environnement publiques.
 * Le site est une vitrine : il ne lit que l'URL du site + Supabase (contenu,
 * avec fallback en dur). Tout est guardé — l'app ne crash pas si une clé manque.
 */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
