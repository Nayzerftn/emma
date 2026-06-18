import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./types";

/**
 * Client Supabase public (anon, sans cookies/session) pour les lectures
 * publiques côté serveur. Sans dépendance aux cookies, les pages peuvent
 * rester statiques (ISR). À n'utiliser que derrière un garde `hasSupabase`.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
