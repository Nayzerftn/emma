// Vérification UI + base de la redistribution en masse (reassignLessons).
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3002";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const pdate = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(iso));

let pass = 0, fail = 0;
const check = (label, ok) => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${label}`);
};

// Sélectionne fromTeacher (le plus de cours planifiés) + toTeacher (active, sans cours → pas de conflit).
const { data: teams } = await db
  .from("team_members")
  .select("id,name,is_active")
  .eq("is_active", true)
  .order("display_order");
const { data: sched } = await db
  .from("lessons")
  .select("id,teacher_id,starts_at,duration_min")
  .eq("status", "scheduled");
const byT = {};
for (const l of sched) (byT[l.teacher_id] ??= []).push(l);
const fromId = Object.keys(byT).sort((a, b) => byT[b].length - byT[a].length)[0];
const fromTeacher = teams.find((t) => t.id === fromId);
const emptyTeacher = teams.find((t) => t.id !== fromId && !byT[t.id]);
const toTeacher = emptyTeacher ?? teams.find((t) => t.id !== fromId);
const fromLessons = byT[fromId];
const dates = [...new Set(fromLessons.map((l) => pdate(l.starts_at)))].sort();
const fromDate = dates[0];
const toDate = dates[dates.length - 1];
console.log(
  `from=${fromTeacher.name} (${fromLessons.length} cours) → to=${toTeacher.name}${emptyTeacher ? " (vide)" : ""} · période ${fromDate}→${toDate}`,
);

// Taux de paie attendu de la remplaçante
const { data: toSet } = await db
  .from("teacher_settings")
  .select("payout_30_cents,payout_60_cents")
  .eq("teacher_id", toTeacher.id)
  .maybeSingle();
const rate = (d) => (d === 30 ? (toSet?.payout_30_cents ?? 2500) : (toSet?.payout_60_cents ?? 4000));

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "contact@nayzerapp.com");
  await page.fill("#password", "NatationCB2026!");
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
  await page.goto(`${BASE}/admin/planning-domicile`, { waitUntil: "networkidle" });

  const panel = page.getByTestId("redistribute");
  await panel.getByText("Redistribution en masse").click();
  await page.waitForTimeout(300);

  await panel.locator('label:has-text("Professeure absente") select').selectOption({ label: fromTeacher.name });
  await panel.locator('label:has-text("Remplaçante") select').selectOption({ label: toTeacher.name });
  await panel.locator('input[type="date"]').nth(0).fill(fromDate);
  await panel.locator('input[type="date"]').nth(1).fill(toDate);
  // markUnavailable est coché par défaut
  await panel.getByRole("button", { name: /Redistribuer/ }).click();
  await page.waitForTimeout(2500); // server action (réaffectations séquentielles) + revalidate

  const okToast = await page.getByText(/réaffecté/).count();
  check("toast de confirmation « … réaffecté(s) »", okToast > 0);

  // Base : combien réellement déplacés vs restés (conflit)
  const ids = fromLessons.map((l) => l.id);
  const { data: after } = await db.from("lessons").select("id,teacher_id,duration_min,payout_cents").in("id", ids);
  const moved = after.filter((l) => l.teacher_id === toTeacher.id);
  const stayed = after.filter((l) => l.teacher_id === fromId);
  check(`au moins un cours réaffecté (${moved.length}/${fromLessons.length})`, moved.length > 0);
  check(`invariant : déplacés + restés = total (${moved.length}+${stayed.length}=${fromLessons.length})`, moved.length + stayed.length === fromLessons.length);

  const payoutsOk = moved.every((l) => l.payout_cents === rate(l.duration_min));
  check("paie recalculée au taux de la remplaçante sur les cours déplacés", payoutsOk);

  // Exceptions ajoutées au planning de la prof absente
  const { data: fromSet } = await db
    .from("teacher_settings")
    .select("availability")
    .eq("teacher_id", fromId)
    .maybeSingle();
  const exDates = new Set((fromSet?.availability?.exceptions ?? []).filter((e) => e.off).map((e) => e.date));
  const allCovered = dates.every((d) => exDates.has(d));
  check(`prof absente marquée indisponible (exceptions couvrent ${dates.length} date(s))`, allCovered);

  // Scénario conflit : redistribuer la paire de battement (Thaïs 14h00/14h15) → 1 cours ignoré
  const { data: thais } = await db.from("team_members").select("id,name").ilike("name", "%Thaïs%").maybeSingle();
  if (thais) {
    const { data: tl } = await db
      .from("lessons")
      .select("id,starts_at")
      .eq("teacher_id", thais.id)
      .eq("status", "scheduled");
    const tDates = [...new Set((tl ?? []).map((l) => pdate(l.starts_at)))].sort();
    const empty2 = teams.find((t) => t.id !== thais.id && t.id !== toTeacher.id && !byT[t.id]);
    if (tl && tl.length >= 2 && empty2 && tDates.length) {
      await page.reload({ waitUntil: "networkidle" });
      const p2 = page.getByTestId("redistribute");
      await p2.getByText("Redistribution en masse").click();
      await page.waitForTimeout(300);
      await p2.locator('label:has-text("Professeure absente") select').selectOption({ label: thais.name });
      await p2.locator('label:has-text("Remplaçante") select').selectOption({ label: empty2.name });
      await p2.locator('input[type="date"]').nth(0).fill(tDates[0]);
      await p2.locator('input[type="date"]').nth(1).fill(tDates[tDates.length - 1]);
      await p2.getByRole("button", { name: /Redistribuer/ }).click();
      await page.waitForTimeout(2500);
      const skipToast = await page.getByText(/ignoré|conflit/i).count();
      const { data: tAfter } = await db
        .from("lessons")
        .select("id,teacher_id")
        .in("id", tl.map((l) => l.id));
      const tStayed = tAfter.filter((l) => l.teacher_id === thais.id).length;
      check(`conflit de battement : au moins 1 cours non réaffecté (resté : ${tStayed})`, tStayed >= 1);
      check("toast signale les cours ignorés", skipToast > 0);
    } else {
      console.log("  (scénario conflit Thaïs ignoré : pré-requis non réunis)");
    }
  }

  console.log(`\nRésultat : ${pass} OK · ${fail} échec(s)`);
} catch (e) {
  console.error("ERREUR script :", e.message);
  fail++;
} finally {
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
