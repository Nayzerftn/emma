/**
 * Vérifie la RLS comme un utilisateur anonyme (clé anon).
 * Lectures publiques OK ; écritures/lectures sensibles refusées.
 * Usage : pnpm db:check
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);

async function main() {
  const team = await anon.from("team_members").select("slug,name");
  console.log(
    "• team_members (lecture publique) :",
    team.error ? `ERREUR ${team.error.message}` : `${team.data?.length} lignes ✓`,
  );

  const slots = await anon.from("pool_slots").select("id,audience,price_cents");
  console.log(
    "• pool_slots (lecture publique, futurs/ouverts) :",
    slots.error ? `ERREUR ${slots.error.message}` : `${slots.data?.length} lignes ✓`,
  );

  const faq = await anon.from("faq_items").select("id").eq("published", true);
  console.log(
    "• faq_items (lecture publique) :",
    faq.error ? `ERREUR ${faq.error.message}` : `${faq.data?.length} lignes ✓`,
  );

  const bookings = await anon.from("bookings").select("id");
  console.log(
    "• bookings (anon, doit être vide/refusé) :",
    bookings.error
      ? `refusé (${bookings.error.message}) ✓`
      : `${bookings.data?.length ?? 0} lignes visibles ${bookings.data?.length ? "✗ FUITE" : "✓"}`,
  );

  const upd = await anon
    .from("team_members")
    .update({ name: "HACK" })
    .eq("slug", "emma")
    .select();
  console.log(
    "• team_members update (anon, doit échouer) :",
    upd.error
      ? `refusé (${upd.error.message}) ✓`
      : `${upd.data?.length ?? 0} lignes modifiées ${upd.data?.length ? "✗ FAILLE" : "✓ (0 modifiée)"}`,
  );
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
