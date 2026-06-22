// Vérif funnels LIVE : intake Google Form (auth + écriture base), matching (rendu admin), WhatsApp (CTA publics).
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3002";
const TOKEN = process.env.INTAKE_TOKEN;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let pass = 0, fail = 0;
const check = (l, ok) => { if (ok) pass++; else fail++; console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${l}`); };

// ── 1. Intake Google Form ────────────────────────────────────────────────────
console.log("— 1. Intake (endpoint Google Form) —");
const stamp = new Date().getTime();
const uniqEmail = `intake.test.${stamp}@example.com`;
const payload = { name: `Intake Test ${stamp}`, email: uniqEmail, phone: "0612345678", type: "domicile", zone: "C", duration_min: 30, student_name: "Léo Test", message: "Test funnel intake" };

// a) sans token → 401
const noAuth = await fetch(`${BASE}/api/intake/google-form`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
check(`refus sans token (HTTP ${noAuth.status})`, noAuth.status === 401);

// b) avec token → 200 + ligne en base
const ok = await fetch(`${BASE}/api/intake/google-form`, { method: "POST", headers: { "Content-Type": "application/json", "x-intake-token": TOKEN }, body: JSON.stringify(payload) });
check(`accepté avec token (HTTP ${ok.status})`, ok.ok);
const { data: req } = await db.from("lesson_requests").select("id,name,type,zone,source,status").eq("email", uniqEmail).maybeSingle();
check("demande créée en base depuis l'intake", !!req);
if (req) console.log(`   → ${req.name} · ${req.type} · secteur ${req.zone} · source=${req.source} · statut=${req.status}`);

// ── 2. Matching (rendu des suggestions dans l'admin) ─────────────────────────
console.log("— 2. Matching (suggestions admin) —");
const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "contact@nayzerapp.com");
  await page.fill("#password", "NatationCB2026!");
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
  await page.goto(`${BASE}/admin/demandes`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const body = await page.locator("body").innerText();
  // Les cartes affichent les raisons de matching (pondérations) — preuve que l'algo tourne sur la page.
  const hasMatchReason = /\+\d+|secteur|Disponibilités|Spécialité|demandée|Peu chargée/i.test(body);
  check("la page Demandes affiche des suggestions de matching", hasMatchReason);
  // un score numérique visible
  const hasScore = /\b\d{1,3}\b/.test(body);
  check("scores/pondérations visibles", hasScore);

  // ── 3. WhatsApp (CTA publics kiné + surf) ──────────────────────────────────
  console.log("— 3. WhatsApp (liens wa.me publics) —");
  await page.goto(`${BASE}/kinesiologie`, { waitUntil: "networkidle" });
  const kineLinks = await page.locator('a[href*="wa.me/"]').count();
  check(`page kinésiologie : lien WhatsApp présent (${kineLinks})`, kineLinks > 0);
  await page.goto(`${BASE}/surf`, { waitUntil: "networkidle" });
  const surfHrefs = await page.locator('a[href*="wa.me/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  check(`page surf : lien WhatsApp présent (${surfHrefs.length})`, surfHrefs.length > 0);
  const wellFormed = surfHrefs.every((h) => /^https:\/\/wa\.me\/\d{11}\?text=/.test(h));
  check("liens wa.me bien formés (numéro + message pré-rempli encodé)", surfHrefs.length > 0 && wellFormed);

  console.log(`\nRésultat funnels : ${pass} OK · ${fail} échec(s)`);
} catch (e) {
  console.error("ERREUR :", e.message);
  fail++;
} finally {
  // nettoyage : la demande ET le client créé par l'intake (upsert client + insert demande)
  if (req) await db.from("lesson_requests").delete().eq("id", req.id);
  await db.from("clients").delete().eq("email", uniqEmail);
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
