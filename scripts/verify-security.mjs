// Vérif sécurité LIVE : RLS (PII protégé du public), gates proxy, cloisonnement prof réel.
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3002";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

let pass = 0, fail = 0;
const check = (l, ok) => { if (ok) pass++; else fail++; console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${l}`); };

// ── A. RLS : un visiteur anonyme ne doit PAS lire le PII plateforme ───────────
console.log("— A. RLS (clé anonyme) —");
for (const table of ["clients", "lessons", "lesson_requests", "invoices"]) {
  const { data } = await anon.from(table).select("*").limit(5);
  check(`anon ne lit pas « ${table} » (0 ligne)`, (data?.length ?? 0) === 0);
}
const { error: insErr } = await anon.from("clients").insert({ name: "hack", email: "h@h.com" });
check("anon ne peut PAS insérer dans « clients »", !!insErr);
const { data: pub } = await anon.from("team_members").select("id").eq("is_active", true).limit(1);
check("anon LIT bien « team_members » publics (RLS pas juste tout-bloqué)", (pub?.length ?? 0) > 0);

// ── B. Proxy : /admin et /prof inaccessibles sans session ─────────────────────
console.log("— B. Gates proxy (non authentifié) —");
for (const path of ["/admin/planning-domicile", "/admin/familles", "/prof"]) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const loc = res.headers.get("location") || "";
  const blocked = res.status >= 300 && res.status < 400 && /login/.test(loc);
  check(`${path} → redirige vers login (${res.status})`, blocked);
}

// ── C. Cloisonnement prof réel (compte jetable, nettoyé en fin) ───────────────
console.log("— C. Cloisonnement prof (login réel) —");
const email = "zz-test-prof@example.com";
const pw = "ZzTestNCB4242!";
const future = new Date(new Date().getTime() + 2 * 86400_000).toISOString();
let authUserId = null, tmId = null, otherLessonId = null, myLessonId = null, otherTeacherId = null;

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  // purge éventuelle d'un run précédent
  const { data: existing } = await admin.from("team_members").select("id,auth_user_id").eq("email", email).maybeSingle();
  if (existing) {
    await admin.from("lessons").delete().eq("teacher_id", existing.id);
    await admin.from("team_members").delete().eq("id", existing.id);
    if (existing.auth_user_id) await admin.auth.admin.deleteUser(existing.auth_user_id).catch(() => {});
  }

  // compte auth + team_member jetables
  const { data: created, error: cErr } = await admin.auth.admin.createUser({ email, password: pw, email_confirm: true });
  if (cErr) throw new Error("createUser: " + cErr.message);
  authUserId = created.user.id;
  const { data: tm, error: tErr } = await admin
    .from("team_members")
    .insert({ slug: "zz-test-prof", name: "ZZ Test Prof", role: "Maître-nageuse", bio: "", tagline: "", services: ["domicile"], is_active: true, display_order: 999, auth_user_id: authUserId, email })
    .select()
    .single();
  if (tErr) throw new Error("insert team_member: " + tErr.message);
  tmId = tm.id;

  // un cours pour la prof jetable + un cours pour une AUTRE prof (sonde de fuite)
  const mk = (teacher_id, student_name) => admin.from("lessons").insert({ teacher_id, student_name, starts_at: future, duration_min: 30, status: "scheduled", price_cents: 4000, payout_cents: 2500, zone: "C" }).select("id").single();
  ({ data: { id: myLessonId } } = await mk(tmId, "ELEVE_ZZTEST_OK"));
  const { data: other } = await admin.from("team_members").select("id").neq("id", tmId).eq("is_active", true).limit(1).single();
  otherTeacherId = other.id;
  ({ data: { id: otherLessonId } } = await mk(otherTeacherId, "ELEVE_AUTRE_FUITE"));

  // login réel via /prof/login
  await page.goto(`${BASE}/prof/login`, { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", pw);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
  await page.waitForTimeout(800);
  const body = await page.locator("body").innerText();

  check("prof voit SON cours (ELEVE_ZZTEST_OK)", body.includes("ELEVE_ZZTEST_OK"));
  check("prof NE voit PAS le cours d'une autre prof (cloisonnement)", !body.includes("ELEVE_AUTRE_FUITE"));

  console.log(`\nRésultat sécurité : ${pass} OK · ${fail} échec(s)`);
} catch (e) {
  console.error("ERREUR :", e.message);
  fail++;
} finally {
  // nettoyage
  if (myLessonId) await admin.from("lessons").delete().eq("id", myLessonId);
  if (otherLessonId) await admin.from("lessons").delete().eq("id", otherLessonId);
  if (tmId) await admin.from("team_members").delete().eq("id", tmId);
  if (authUserId) await admin.auth.admin.deleteUser(authUserId).catch(() => {});
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
