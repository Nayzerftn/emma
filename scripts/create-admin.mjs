import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const email = process.env.ADMIN_EMAIL || "contact@nayzerapp.com";
const password = process.env.ADMIN_PASSWORD || "NatationCB2026!";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

let userId;
const created = await sb.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (created.error) {
  if (/already|registered|exists/i.test(created.error.message)) {
    const { data } = await sb.auth.admin.listUsers();
    userId = data.users.find((u) => u.email === email)?.id;
    console.log("ℹ️  utilisateur déjà existant, réutilisé");
  } else {
    console.log("❌ createUser:", created.error.message);
    process.exit(1);
  }
} else {
  userId = created.data.user.id;
  console.log("✅ utilisateur auth créé");
}

const { error } = await sb.from("admins").upsert({ id: userId, email });
console.log(
  error ? `❌ admins: ${error.message}` : `✅ admin prêt → ${email} / ${password}`,
);
