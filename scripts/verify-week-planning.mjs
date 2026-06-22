// Vérification UI du planning semaine (grille + couleurs + glisser-déposer).
// Lance Playwright contre le serveur dev (port 3002) + vérifie en base via service role.
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3002";
const EMAIL = "contact@nayzerapp.com";
const PASSWORD = "NatationCB2026!";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const startsAtOf = async (id) => {
  const { data } = await db.from("lessons").select("starts_at").eq("id", id).single();
  return data?.starts_at ?? null;
};

let pass = 0, fail = 0;
const check = (label, ok) => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${label}`);
};

// Dispatch un vrai glisser-déposer HTML5 (dragstart sur le cours → drop sur la colonne à clientY).
// NB : fonctions réelles (pas des chaînes) sinon Playwright ignore l'argument.
const DRAGSTART = ({ lessonId }) => {
  const block = document.querySelector(`[data-lesson-id="${lessonId}"]`);
  if (!block) return "missing";
  block.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
  return "started";
};
const DROP = ({ dayStr, clientY }) => {
  const col = document.querySelector(`[data-day="${dayStr}"]`);
  if (!col) return "missing";
  const dt = new DataTransfer();
  col.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt, clientY }));
  col.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt, clientY }));
  return "dropped";
};

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("  [browser error]", m.text()); });

try {
  // 1. Connexion admin
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
  check("connexion admin", true);

  // 2. Planning domicile → vue Semaine
  await page.goto(`${BASE}/admin/planning-domicile`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Semaine" }).click();
  await page.waitForTimeout(400);

  // 3. Rendu de la grille — 7 colonnes jour + légende profs
  const dayCols = await page.locator("[data-day]").count();
  check(`grille = 7 colonnes jour (vu : ${dayCols})`, dayCols === 7);

  // Naviguer jusqu'à une semaine contenant des cours (max 6 sauts)
  let blocks = 0;
  for (let i = 0; i < 6; i++) {
    blocks = await page.locator("[data-lesson-id]").count();
    if (blocks > 0) break;
    await page.getByRole("button", { name: "→" }).click();
    await page.waitForTimeout(300);
  }
  check(`cours affichés dans la grille (vu : ${blocks})`, blocks > 0);

  // Légende couleur (au moins une pastille de couleur prof)
  const legendSwatches = await page.locator("span.inline-block.rounded-sm").count();
  check(`légende couleur par prof (vu : ${legendSwatches})`, legendSwatches > 0);

  // Cartographie des cours visibles + leur colonne (data-day) et position verticale
  const visible = await page.$$eval("[data-lesson-id]", (els) =>
    els.map((el) => {
      const col = el.closest("[data-day]");
      const r = el.getBoundingClientRect();
      return {
        id: el.getAttribute("data-lesson-id"),
        day: col?.getAttribute("data-day") ?? null,
        midY: r.top + r.height / 2,
        draggable: el.getAttribute("draggable") === "true",
      };
    }),
  );
  const draggables = visible.filter((v) => v.draggable);
  check(`cours déplaçables présents (vu : ${draggables.length})`, draggables.length > 0);

  // Tous les jours visibles (colonnes) pour choisir une cible vide
  const allDays = await page.$$eval("[data-day]", (els) => els.map((e) => e.getAttribute("data-day")));

  // 4. DÉPLACEMENT VALIDE — glisser un cours vers une autre journée, tout en haut (8h00, libre)
  const mover = draggables[0];
  const targetDay = allDays.find((d) => d !== mover.day) ?? mover.day;
  const colTop = await page.$eval(`[data-day="${targetDay}"]`, (el) => el.getBoundingClientRect().top);
  const before = await startsAtOf(mover.id);

  await page.evaluate(DRAGSTART, { lessonId: mover.id });
  await page.waitForTimeout(350);
  await page.evaluate(DROP, { dayStr: targetDay, clientY: colTop + 2 }); // ~8h00 en haut de colonne
  await page.waitForTimeout(1600); // server action + revalidate

  const movedToast = await page.getByText("Cours déplacé.").count();
  const after = await startsAtOf(mover.id);
  check("déplacement valide → toast « Cours déplacé. »", movedToast > 0);
  check(`déplacement valide → starts_at modifié en base (${before} → ${after})`, before !== after && !!after);

  // 5. DÉPLACEMENT EN CONFLIT — deux cours de la MÊME prof le même jour → lâcher l'un sur l'autre
  //    (battement < 30 min ⇒ refus). On regroupe via la base.
  const ids = visible.map((v) => v.id);
  const { data: rows } = await db
    .from("lessons")
    .select("id,teacher_id,starts_at,status")
    .in("id", ids)
    .eq("status", "scheduled");
  const byTeacherDay = new Map();
  for (const r of rows ?? []) {
    const day = (r.starts_at ?? "").slice(0, 10);
    const k = `${r.teacher_id}|${day}`;
    byTeacherDay.set(k, [...(byTeacherDay.get(k) ?? []), r.id]);
  }
  const conflictPair = [...byTeacherDay.values()].find((arr) => arr.length >= 2);

  if (!conflictPair) {
    console.log("  (pas de paire même-prof/même-jour visible cette semaine — test conflit ignoré)");
  } else {
    const [aId, bId] = conflictPair;
    const bMeta = visible.find((v) => v.id === bId);
    const beforeConflict = await startsAtOf(aId);
    // lâcher A à la position verticale de B (même prof, même jour) → battement violé
    await page.evaluate(DRAGSTART, { lessonId: aId });
    await page.waitForTimeout(350);
    await page.evaluate(DROP, { dayStr: bMeta.day, clientY: bMeta.midY });
    await page.waitForTimeout(1600);
    const conflictToast = await page.getByText(/Conflit/).count();
    const afterConflict = await startsAtOf(aId);
    check("déplacement en conflit → toast « Conflit… »", conflictToast > 0);
    check("déplacement en conflit → starts_at INCHANGÉ en base", beforeConflict === afterConflict);
  }

  console.log(`\nRésultat : ${pass} OK · ${fail} échec(s)`);
} catch (e) {
  console.error("ERREUR script :", e.message);
  fail++;
} finally {
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
