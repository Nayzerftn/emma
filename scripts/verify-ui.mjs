// Capture visuelle de l'UI (admin + espace prof) avec vraies données, pour inspection.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3002";
const OUT = "/tmp/ui";
mkdirSync(OUT, { recursive: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const adminPages = [
  ["dashboard", "/admin"],
  ["demandes", "/admin/demandes"],
  ["planning-liste", "/admin/planning-domicile"],
  ["familles", "/admin/familles"],
  ["paie", "/admin/paie"],
  ["professeures", "/admin/professeures"],
  ["reservations", "/admin/reservations"],
  ["leads", "/admin/leads"],
];

const browser = await chromium.launch();

// ── Admin (desktop) ───────────────────────────────────────────────────────────
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill("#email", "contact@nayzerapp.com");
await page.fill("#password", "NatationCB2026!");
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });

for (const [name, path] of adminPages) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/admin-${name}.png`, fullPage: true });
  console.log(`✓ admin-${name}.png`);
}

// Planning vue Semaine (grille couleur + cours)
await page.goto(`${BASE}/admin/planning-domicile`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Semaine" }).click();
await page.waitForTimeout(400);
for (let i = 0; i < 6; i++) {
  if ((await page.locator("[data-lesson-id]").count()) > 0) break;
  await page.getByRole("button", { name: "→" }).click();
  await page.waitForTimeout(300);
}
await page.screenshot({ path: `${OUT}/admin-planning-semaine.png`, fullPage: true });
console.log("✓ admin-planning-semaine.png");

// Redistribution panneau ouvert
await page.getByText("Redistribution en masse").click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/admin-redistribution.png` });
console.log("✓ admin-redistribution.png");
await ctx.close();

// ── Espace prof (mobile) avec compte jetable + cours ──────────────────────────
const email = "zz-ui-prof@example.com", pw = "ZzUiNCB4242!";
let authUserId = null, tmId = null;
try {
  const ex = await db.from("team_members").select("id,auth_user_id").eq("email", email).maybeSingle();
  if (ex.data) {
    await db.from("lessons").delete().eq("teacher_id", ex.data.id);
    await db.from("team_members").delete().eq("id", ex.data.id);
    if (ex.data.auth_user_id) await db.auth.admin.deleteUser(ex.data.auth_user_id).catch(() => {});
  }
  const u = await db.auth.admin.createUser({ email, password: pw, email_confirm: true });
  authUserId = u.data.user.id;
  const tm = await db.from("team_members").insert({ slug: "zz-ui-prof", name: "Clara D. (démo)", role: "Maître-nageuse", bio: "", tagline: "", services: ["domicile"], is_active: true, display_order: 998, auth_user_id: authUserId, email }).select().single();
  tmId = tm.data.id;
  const day = (n, h) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  await db.from("lessons").insert([
    { teacher_id: tmId, student_name: "Léa Martin", starts_at: day(1, 10), duration_min: 30, status: "scheduled", price_cents: 4000, payout_cents: 2500, zone: "C", address: "12 av. de la Plage, Biarritz" },
    { teacher_id: tmId, student_name: "Tom Dubois", starts_at: day(1, 11), duration_min: 60, status: "scheduled", price_cents: 6500, payout_cents: 4000, zone: "C", address: "5 rue des Vagues, Anglet" },
    { teacher_id: tmId, student_name: "Jade Petit", starts_at: day(3, 14), duration_min: 30, status: "scheduled", price_cents: 4000, payout_cents: 2500, zone: "D", address: "8 chemin du Phare, Bidart" },
  ]);

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await mctx.newPage();
  await mp.goto(`${BASE}/prof/login`, { waitUntil: "networkidle" });
  await mp.fill("#email", email);
  await mp.fill("#password", pw);
  await mp.click('button[type="submit"]');
  await mp.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
  await mp.waitForTimeout(800);
  await mp.screenshot({ path: `${OUT}/prof-mobile.png`, fullPage: true });
  console.log("✓ prof-mobile.png");
  await mctx.close();
} finally {
  if (tmId) await db.from("lessons").delete().eq("teacher_id", tmId);
  if (tmId) await db.from("team_members").delete().eq("id", tmId);
  if (authUserId) await db.auth.admin.deleteUser(authUserId).catch(() => {});
  await browser.close();
}
console.log("\nScreenshots dans " + OUT);
