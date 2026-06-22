/**
 * Applique le schéma + RLS + seed sur le projet Supabase cloud.
 * Lit la connexion depuis .env.local :
 *   - SUPABASE_DB_URL (recommandé : URI complète depuis Supabase → Settings → Database)
 *   - sinon SUPABASE_DB_PASSWORD (+ NEXT_PUBLIC_SUPABASE_URL) → connexion directe.
 *
 * Usage : pnpm db:setup
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.local" });

function connectionString(): string {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const pw = process.env.SUPABASE_DB_PASSWORD;
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
    /https:\/\/([a-z0-9]+)\.supabase\.co/,
  )?.[1];
  if (!pw || !ref) {
    throw new Error(
      "Renseigne SUPABASE_DB_URL (URI complète) ou SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL dans .env.local.",
    );
  }
  return `postgresql://postgres:${encodeURIComponent(pw)}@db.${ref}.supabase.co:5432/postgres`;
}

const FILES = [
  "supabase/migrations/0001_schema.sql",
  "supabase/migrations/0002_rls.sql",
  "supabase/migrations/0003_platform.sql",
  "supabase/migrations/0004_lessons_invoice_link.sql",
  "supabase/migrations/0005_request_status_timestamp.sql",
  "supabase/migrations/0006_teacher_accounts.sql",
  "supabase/seed.sql",
];

async function main() {
  const client = new Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  for (const file of FILES) {
    const sql = readFileSync(join(process.cwd(), file), "utf8");
    process.stdout.write(`→ ${file} ... `);
    await client.query(sql);
    console.log("ok");
  }
  await client.end();
  console.log("✓ Base appliquée (schéma + RLS + seed).");
}

main().catch((err) => {
  console.error("✗ Échec :", err.message);
  console.error(
    "Astuce : colle l'URI complète dans SUPABASE_DB_URL (Supabase → Settings → Database → Connection string → URI).",
  );
  process.exit(1);
});
