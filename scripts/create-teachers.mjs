/**
 * Crée un compte auth par professeure (espace /prof) et le lie à son
 * team_member (auth_user_id + email). Idempotent : réutilise le compte
 * existant et réinitialise le mot de passe.
 *
 * Lancer : node --env-file=.env.local scripts/create-teachers.mjs
 * Affiche les identifiants (login + mot de passe) de chaque prof.
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// Mot de passe lisible : Prenom + 4 chiffres + symbole (assez fort, simple à transmettre).
function genPassword(slug) {
  const base = slug.replace(/[^a-z]/g, "");
  const cap = base.charAt(0).toUpperCase() + base.slice(1);
  const digits = (parseInt(randomBytes(2).toString("hex"), 16) % 9000) + 1000;
  return `${cap}NCB${digits}!`;
}

async function findUserByEmail(email) {
  // pagination simple (≤ quelques centaines d'utilisateurs)
  for (let page = 1; page <= 5; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const u = data.users.find((x) => x.email === email);
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const { data: team } = await db
    .from("team_members")
    .select("id, slug, name")
    .order("display_order");

  const out = [];
  for (const t of team) {
    const email = `${t.slug}@natationcotebasque.fr`;
    const password = genPassword(t.slug);

    let userId;
    const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) {
      const existing = await findUserByEmail(email);
      if (!existing) {
        console.log(`❌ ${t.name}: ${created.error.message}`);
        continue;
      }
      userId = existing.id;
      await db.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else {
      userId = created.data.user.id;
    }

    const { error } = await db
      .from("team_members")
      .update({ auth_user_id: userId, email })
      .eq("id", t.id);
    if (error) {
      console.log(`❌ ${t.name}: lien team_member — ${error.message}`);
      continue;
    }
    out.push({ Professeure: t.name, Login: email, "Mot de passe": password });
  }

  console.log("\n✅ Comptes professeures (espace /prof) :\n");
  console.table(out);
  console.log("\nConnexion : /prof/login");
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
