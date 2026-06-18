import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseAdmin } from "@/lib/env";
import type { Database } from "./types";

/**
 * Client Supabase avec la clé service role — SERVEUR UNIQUEMENT.
 * Réservé aux écritures critiques (webhook Stripe, incrément de capacité,
 * opérations admin sensibles). Ne jamais exposer au client.
 */
export function createSupabaseAdminClient() {
  if (!hasSupabaseAdmin) {
    throw new Error(
      "Client admin Supabase indisponible : SUPABASE_SERVICE_ROLE_KEY manquante.",
    );
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
