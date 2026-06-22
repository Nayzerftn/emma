/**
 * Seed E2E réaliste & reproductible — plateforme Natation Côte Basque.
 *
 * Lancer :   node --env-file=.env.local scripts/seed-platform-e2e.mjs
 * Nettoyer : node --env-file=.env.local scripts/seed-platform-e2e.mjs --clean
 *
 * Idempotent : les IDs créés sont mémorisés dans scripts/.e2e-seed-ids.json
 * et supprimés avant chaque nouveau seed (donc relançable sans doublon).
 *
 * Données : vrais prénoms/communes de la Côte Basque, secteurs A–J cohérents,
 * montants conformes au brief (40/65 € client, 25/40 € paie). La famille
 * « Lasalle » reproduit volontairement l'exemple du brief = 410 € dû.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IDS_FILE = join(__dirname, ".e2e-seed-ids.json");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// IDs réels des professeures (récupérés du projet).
const T = {
  oiana: "0adf21b8-5853-484b-882b-164ee257b80a",
  thais: "f51a0946-bc4f-4806-bd1f-b96f050f3954",
  clara: "ddb28f48-ea5f-4242-a0c9-7361a8da74d0",
  audrey: "46e6e7e5-46e3-42c4-96aa-7cf221cafe4b",
};

// Décalage horaire jour J relatif, heure locale → ISO (instant correct).
function at(dayOffset, hh, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

async function clean(ids) {
  if (ids.invoices?.length) await db.from("invoices").delete().in("id", ids.invoices);
  if (ids.lessons?.length) await db.from("lessons").delete().in("id", ids.lessons);
  if (ids.lesson_requests?.length)
    await db.from("lesson_requests").delete().in("id", ids.lesson_requests);
  if (ids.clients?.length) await db.from("clients").delete().in("id", ids.clients);
  if (ids.teacher_settings?.length)
    await db.from("teacher_settings").delete().in("teacher_id", ids.teacher_settings);
}

async function main() {
  const prior = existsSync(IDS_FILE) ? JSON.parse(readFileSync(IDS_FILE, "utf8")) : {};
  await clean(prior);
  if (process.argv.includes("--clean")) {
    writeFileSync(IDS_FILE, JSON.stringify({}, null, 2));
    console.log("✓ Données E2E nettoyées.");
    return;
  }

  const ids = { teacher_settings: [], clients: [], lesson_requests: [], lessons: [], invoices: [] };

  /* ── 1. Réglages professeures (fenêtres horaires) ──────────── */
  const AM = { start: "09:00", end: "12:00" };
  const PM = { start: "14:00", end: "18:00" };
  const settings = [
    // Oïana — Bidart/Biarritz, dispo Lun/Mer/Ven matin + Sam matin & après-midi
    { teacher_id: T.oiana, zones: ["B", "C", "D"], max_per_day: 5,
      availability: { base: [
        { weekday: 1, windows: [AM] }, { weekday: 3, windows: [AM] },
        { weekday: 5, windows: [AM] }, { weekday: 6, windows: [AM, PM] },
      ], exceptions: [] } },
    // Thaïs — Biarritz/Anglet, dispo Mar/Jeu après-midi + Sam matin
    { teacher_id: T.thais, zones: ["C", "D", "E"], max_per_day: 5,
      availability: { base: [
        { weekday: 2, windows: [PM] }, { weekday: 4, windows: [PM] },
        { weekday: 6, windows: [AM] },
      ], exceptions: [] } },
    // Clara — Anglet/Bayonne, dispo en semaine après-midi
    { teacher_id: T.clara, zones: ["E", "F", "G"], max_per_day: 6,
      availability: { base: [
        { weekday: 1, windows: [PM] }, { weekday: 2, windows: [PM] },
        { weekday: 4, windows: [PM] },
      ], exceptions: [] } },
    // Audrey — Guéthary/Bidart, AUCUNE disponibilité déclarée (cas edge matching)
    { teacher_id: T.audrey, zones: ["A", "B"], max_per_day: 4,
      availability: { base: [], exceptions: [] } },
  ];
  for (const s of settings) {
    await db.from("teacher_settings").upsert(
      { ...s, payout_30_cents: 2500, payout_60_cents: 4000, updated_at: new Date().toISOString() },
      { onConflict: "teacher_id" },
    );
    ids.teacher_settings.push(s.teacher_id);
  }

  /* ── 2. Familles (clients) ─────────────────────────────────── */
  const families = [
    { name: "Marie Lasalle", email: "marie.lasalle@gmail.com", phone: "0612345678" }, // Biarritz C
    { name: "Peio Etcheverry", email: "p.etcheverry@orange.fr", phone: "0623456789" }, // Anglet E
    { name: "Sophie Dubois", email: "sophie.dubois@outlook.fr", phone: "0634567890" }, // Bidart B
    { name: "Inès Garcia", email: "ines.garcia@gmail.com", phone: "0645678901" }, // Guéthary A
    { name: "Famille Hiriart", email: null, phone: "0656789012" }, // sans email (edge relance)
  ];
  const C = {};
  for (const f of families) {
    const { data } = await db.from("clients").insert(f).select("id").single();
    C[f.name] = data.id;
    ids.clients.push(data.id);
  }

  /* ── 3. Demandes (lesson_requests) — cas variés ────────────── */
  const requests = [
    // R1 nominal : domicile zone C, prof demandée Oïana → match évident
    { client_id: C["Marie Lasalle"], name: "Marie Lasalle", email: "marie.lasalle@gmail.com",
      phone: "0612345678", type: "domicile", zone: "C", address: "8 rue Gambetta, 64200 Biarritz",
      student_name: "Léa", student_age: 7, student_level: "débutante",
      objective: "Apprivoiser l'eau, premières brasses", weeks: "Juillet–août",
      slots_wanted: "Mercredi matin", frequency: "2×/semaine", duration_min: 30, nb_courses: 8,
      preferred_teacher_id: T.oiana, source: "site", status: "new" },
    // R2 océan zone E sans préférence → plusieurs candidates (Thaïs/Clara)
    { client_id: C["Peio Etcheverry"], name: "Peio Etcheverry", email: "p.etcheverry@orange.fr",
      phone: "0623456789", type: "ocean", zone: "E", address: "25 avenue de Bayonne, 64600 Anglet",
      student_name: "Tom", student_age: 10, student_level: "intermédiaire",
      objective: "Aisance en milieu naturel", weeks: "Août", slots_wanted: "Week-end",
      frequency: "1×/semaine", duration_min: 60, nb_courses: 5, source: "google_form", status: "new" },
    // R3 zone J (isolée) : aucune prof ne couvre J ni I → score zone nul partout
    { client_id: C["Sophie Dubois"], name: "Sophie Dubois", email: "sophie.dubois@outlook.fr",
      phone: "0634567890", type: "domicile", zone: "J", address: "Secteur isolé",
      student_name: "Naïa", student_age: 6, student_level: "débutante",
      objective: "Découverte", duration_min: 30, nb_courses: 4, source: "manual", status: "new" },
    // R4 prof demandée SANS dispo (Audrey) → priorité absolue malgré l'absence de dispo
    { client_id: C["Inès Garcia"], name: "Inès Garcia", email: "ines.garcia@gmail.com",
      phone: "0645678901", type: "domicile", zone: "B", address: "3 chemin de l'Église, 64210 Guéthary",
      student_name: "Mateo", student_age: 9, student_level: "faux-débutant",
      objective: "Confiance et autonomie", duration_min: 60, nb_courses: 6,
      preferred_teacher_id: T.audrey, source: "site", status: "new" },
    // R5 déjà proposée (pour tester l'étape suivante / affichage)
    { client_id: C["Famille Hiriart"], name: "Famille Hiriart", email: null, phone: "0656789012",
      type: "domicile", zone: "D", address: "Biarritz Côte des Basques",
      student_name: "Ander", student_age: 8, student_level: "débutant",
      duration_min: 30, nb_courses: 8, source: "site", status: "proposed", matched_teacher_id: T.oiana },
  ];
  const R = {};
  for (const r of requests) {
    const { data } = await db.from("lesson_requests").insert(r).select("id").single();
    R[r.student_name] = data.id;
    ids.lesson_requests.push(data.id);
  }

  /* ── 4. Cours (lessons) ────────────────────────────────────── */
  const price = (d) => (d === 30 ? 4000 : 6500);
  const payout = (d) => (d === 30 ? 2500 : 4000);
  const L = (over) => ({
    request_id: R["Léa"], client_id: C["Marie Lasalle"], teacher_id: T.oiana, student_name: "Léa",
    zone: "C", address: "8 rue Gambetta, 64200 Biarritz",
    price_cents: price(over.duration_min), payout_cents: payout(over.duration_min), ...over,
  });
  // Famille Lasalle / Oïana = exemple du brief : 6×30 faits + 2×1h faits + 1×30 annulé<48h = 410 €
  const lessons = [
    L({ starts_at: at(-14, 9, 0), duration_min: 30, status: "done" }),
    L({ starts_at: at(-14, 10, 0), duration_min: 30, status: "done" }), // battement 30 OK
    L({ starts_at: at(-12, 9, 0), duration_min: 30, status: "done" }),
    L({ starts_at: at(-10, 9, 0), duration_min: 30, status: "done" }),
    L({ starts_at: at(-10, 11, 0), duration_min: 60, status: "done" }), // 1h
    L({ starts_at: at(-7, 9, 0), duration_min: 30, status: "done" }),
    L({ starts_at: at(-7, 11, 0), duration_min: 60, status: "done" }), // 1h
    L({ starts_at: at(-5, 9, 0), duration_min: 30, status: "done" }),
    L({ starts_at: at(-5, 10, 30), duration_min: 30, status: "cancelled_late" }), // dû
    // Cours à venir (planning)
    L({ starts_at: at(3, 9, 0), duration_min: 30, status: "scheduled" }),
    L({ starts_at: at(3, 10, 0), duration_min: 30, status: "scheduled" }),
    // Cours annulé normal (NON facturé)
    L({ starts_at: at(-3, 9, 0), duration_min: 30, status: "cancelled" }),
  ];
  // Conflit de battement VOLONTAIRE (Thaïs) pour tester l'alerte UI (15 min d'écart)
  lessons.push(
    { request_id: null, client_id: C["Peio Etcheverry"], teacher_id: T.thais, student_name: "Tom",
      zone: "E", address: "Anglet", starts_at: at(4, 14, 0), duration_min: 30,
      price_cents: 4000, payout_cents: 2500, status: "scheduled" },
    { request_id: null, client_id: C["Peio Etcheverry"], teacher_id: T.thais, student_name: "Tom",
      zone: "E", address: "Anglet", starts_at: at(4, 14, 15), duration_min: 30,
      price_cents: 4000, payout_cents: 2500, status: "scheduled" }, // 15 min → conflit
  );
  for (const l of lessons) {
    const { data } = await db.from("lessons").insert(l).select("id").single();
    ids.lessons.push(data.id);
  }

  /* ── 5. Une facture déjà payée (affichage Familles) ────────── */
  const { data: paidInv } = await db.from("invoices").insert({
    client_id: C["Inès Garcia"], client_name: "Inès Garcia", period_label: "Juin 2026",
    lines: [{ label: "4 cours de 30 min", amount_cents: 16000 }], total_cents: 16000, status: "paid",
  }).select("id").single();
  ids.invoices.push(paidInv.id);

  writeFileSync(IDS_FILE, JSON.stringify(ids, null, 2));
  console.log("✓ Seed E2E créé :");
  console.log(`  ${ids.teacher_settings.length} réglages profs · ${ids.clients.length} familles · ${ids.lesson_requests.length} demandes · ${ids.lessons.length} cours · ${ids.invoices.length} facture`);
  console.log("  Famille Lasalle (Oïana) = exemple brief 410 € · conflit battement Thaïs j+4 14h00/14h15");
}

main().catch((e) => {
  console.error("✗ Seed échoué :", e);
  process.exit(1);
});
