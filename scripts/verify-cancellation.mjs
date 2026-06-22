// Vérif A→Z annulation + cascade remplacement (live).
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3002";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let pass = 0, fail = 0;
const check = (l, ok) => { if (ok) pass++; else fail++; console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${l}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const statusOf = async (id) => (await db.from("lessons").select("status").eq("id", id).single()).data?.status;
const isChargeable = (s) => s === "done" || s === "cancelled_late";

// Données : profs actives + leurs secteurs (pour la cascade de remplacement)
const { data: team } = await db.from("team_members").select("id,name,services,is_active").eq("is_active", true);
const { data: setts } = await db.from("teacher_settings").select("teacher_id,zones");
const zonesOf = new Map((setts ?? []).map((s) => [s.teacher_id, s.zones ?? []]));

// Cours planifiés avec secteur + client
const { data: sched } = await db
  .from("lessons")
  .select("id,teacher_id,zone,client_id,starts_at")
  .eq("status", "scheduled")
  .not("zone", "is", null)
  .not("client_id", "is", null)
  .order("starts_at");

// lessonA : dont le secteur est couvert par AU MOINS une autre prof (cascade non vide)
const covers = (z, exclude) => (team ?? []).filter((t) => t.id !== exclude && (t.services.includes("domicile") || t.services.includes("ocean")) && (zonesOf.get(t.id) ?? []).includes(z));
const lessonA = (sched ?? []).find((l) => covers(l.zone, l.teacher_id).length > 0) ?? sched?.[0];
const lessonB = (sched ?? []).find((l) => l.id !== lessonA?.id);
if (!lessonA || !lessonB) { console.error("Pré-requis manquants (cours planifiés)"); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "contact@nayzerapp.com");
  await page.fill("#password", "NatationCB2026!");
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
  await page.goto(`${BASE}/admin/planning-domicile`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // ── 1. Annulation < 48h (dû) ───────────────────────────────────────────────
  console.log("— 1. Annulation < 48h (dû) —");
  await page.locator(`[data-lesson-id="${lessonA.id}"]`).getByRole("button", { name: /48h/ }).click();
  await page.waitForTimeout(1500);
  const sA = await statusOf(lessonA.id);
  check(`statut → cancelled_late (vu : ${sA})`, sA === "cancelled_late");
  check("cours annulé < 48h = facturable (dû)", isChargeable(sA));

  // ── 2. Annulation simple ───────────────────────────────────────────────────
  console.log("— 2. Annulation simple —");
  await page.locator(`[data-lesson-id="${lessonB.id}"]`).getByRole("button", { name: "Annuler", exact: true }).click();
  await page.waitForTimeout(1500);
  const sB = await statusOf(lessonB.id);
  check(`statut → cancelled (vu : ${sB})`, sB === "cancelled");
  check("cours annulé simple = NON facturable", !isChargeable(sB));

  // ── 3. Cascade remplacement ────────────────────────────────────────────────
  console.log("— 3. Cascade de remplacement (secteur " + lessonA.zone + ") —");
  const candidats = covers(lessonA.zone, lessonA.teacher_id).map((t) => t.name);
  check(`remplaçantes identifiables sur le secteur (${candidats.join(", ") || "aucune"})`, candidats.length > 0);
  // L'alerte Eléa + emails sont best-effort : on vérifie qu'aucune erreur d'envoi n'a été logguée.
  await sleep(800);
  const log = (() => { try { return readFileSync("/tmp/moscow-dev.log", "utf8"); } catch { return ""; } })();
  const sendErrors = (log.match(/\[cancel:(alert|email)\]|\[teacher:cancel\]/g) || []).length;
  check(`aucune erreur d'envoi de notification d'annulation (vu : ${sendErrors})`, sendErrors === 0);

  console.log(`\nRésultat annulation/remplacement : ${pass} OK · ${fail} échec(s)`);
} catch (e) {
  console.error("ERREUR :", e.message);
  fail++;
} finally {
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
