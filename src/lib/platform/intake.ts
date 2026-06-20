/**
 * Ingestion des demandes (brief technique v2 §1 — collecte des données).
 * Source principale : Google Form (via Apps Script → /api/intake/google-form).
 * Sources secondaires : formulaire du site, saisie manuelle admin.
 *
 * `normalizeIntake` est PURE (testée unitairement) : elle accepte un payload
 * brut aux clés variables (libellés du Google Form en français) et le ramène à
 * la forme canonique d'une `lesson_request`. `ingestLessonRequest` fait l'écriture
 * en base (upsert client + insert demande).
 */
import type { LeadType } from "@/lib/supabase/types";
import type { LessonDuration } from "@/lib/supabase/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/env";

export type IntakePayload = {
  name: string;
  email: string | null;
  phone: string | null;
  type: LeadType;
  zone: string | null;
  address: string | null;
  student_name: string | null;
  student_age: number | null;
  student_level: string | null;
  objective: string | null;
  weeks: string | null;
  slots_wanted: string | null;
  frequency: string | null;
  duration_min: LessonDuration;
  nb_courses: number | null;
  preferred_teacher: string | null; // nom libre, résolu en id à l'ingestion
  message: string | null;
};

/** Minuscule, sans accents, alphanumérique compact. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Alias par champ, exprimés en *tokens distinctifs* (mots du libellé), résolus
 * dans un ordre de priorité : les champs spécifiques consomment leur libellé
 * avant les champs génériques, pour éviter les collisions
 * (« Adresse e-mail » → email avant adresse ; « Nom et prénom » → name en dernier).
 */
type Entry = { tokens: string[]; joined: string; value: string };

function buildEntries(raw: Record<string, unknown>): Entry[] {
  return Object.entries(raw)
    .map(([k, v]) => {
      const value = v == null ? "" : String(v).trim();
      const tokens = k.split(/[^A-Za-z0-9À-ÿ]+/).map(norm).filter(Boolean);
      return { tokens, joined: tokens.join(""), value };
    })
    .filter((e) => e.value !== "");
}

function matches(entry: Entry, aliases: string[]): boolean {
  return aliases.some(
    (a) =>
      entry.joined === a ||
      entry.tokens.includes(a) ||
      (a.length >= 6 && entry.joined.includes(a)),
  );
}

/** Résolveur à consommation : chaque libellé n'est attribué qu'une fois. */
function makePicker(raw: Record<string, unknown>) {
  const entries = buildEntries(raw);
  const used = new Set<Entry>();
  return (aliases: string[]): string | null => {
    for (const e of entries) {
      if (used.has(e)) continue;
      if (matches(e, aliases)) {
        used.add(e);
        return e.value;
      }
    }
    return null;
  };
}

function toZone(v: string | null): string | null {
  if (!v) return null;
  const m = v.toUpperCase().match(/\b([A-J])\b/);
  return m ? m[1] : null;
}

function toType(v: string | null): LeadType {
  const n = v ? norm(v) : "";
  if (n.includes("ocean") || n.includes("mer") || n.includes("surf") || n.includes("plage")) return "ocean";
  return "domicile";
}

function toDuration(v: string | null): LessonDuration {
  if (!v) return 30;
  const n = norm(v);
  if (n.includes("60") || n.includes("1h") || n.includes("1heure") || n.includes("heure")) return 60;
  return 30;
}

function toInt(v: string | null): number | null {
  if (!v) return null;
  const m = v.match(/\d+/);
  return m ? Number(m[0]) : null;
}

/**
 * Transforme un payload brut (Google Form, etc.) en demande canonique.
 * Ordre des `take()` = priorité de résolution (spécifique → générique).
 */
export function normalizeIntake(raw: Record<string, unknown>): IntakePayload {
  const take = makePicker(raw);
  const email = take(["email", "mail", "courriel", "adresseemail"]);
  const phone = take(["telephone", "tel", "numero", "portable", "mobile", "gsm", "whatsapp"]);
  const student_age = take(["age", "ageenfant", "agedelenfant"]);
  const student_level = take(["niveau", "niveaunatation"]);
  const student_name = take(["enfant", "prenomenfant", "nomenfant", "prenomdelenfant"]);
  const preferred_teacher = take(["professeure", "professeur", "prof", "maitrenageuse"]);
  const nb_courses = take(["nombre", "nbcours", "nbcourses", "quantite", "combien"]);
  const duration = take(["duree", "duration", "dureecours"]);
  const frequency = take(["frequence", "rythme"]);
  const slots_wanted = take(["creneaux", "creneau", "disponibilites", "disponibilite", "horaires", "horaire"]);
  const weeks = take(["periode", "semaines", "dates", "quand"]);
  const objective = take(["objectif", "objectifs", "objective"]);
  const type = take(["type", "formule", "prestation", "domicileouocean"]);
  const zone = take(["zone", "secteur", "secteurgeographique"]);
  const address = take(["adresse", "ville", "lieu", "adressecomplete"]);
  const message = take(["message", "commentaire", "remarque", "remarques", "precisions", "precision", "infos"]);
  const name = take(["nom", "name", "parent", "famille", "nomprenom", "votrenom"]);

  return {
    name: name ?? "Demande sans nom",
    email,
    phone,
    type: toType(type),
    zone: toZone(zone),
    address,
    student_name,
    student_age: toInt(student_age),
    student_level,
    objective,
    weeks,
    slots_wanted,
    frequency,
    duration_min: toDuration(duration),
    nb_courses: toInt(nb_courses),
    preferred_teacher,
    message,
  };
}

export type IngestResult = { ok: boolean; id?: string; error?: string };

/**
 * Écrit une demande en base : retrouve la professeure préférée par son nom,
 * crée/relie le client (par email puis téléphone), insère la `lesson_request`.
 */
export async function ingestLessonRequest(
  payload: IntakePayload,
  source: "site" | "google_form" | "manual",
): Promise<IngestResult> {
  if (!hasSupabaseAdmin) {
    console.info("[intake:no-db]", source, payload);
    return { ok: true };
  }
  const supabase = createSupabaseAdminClient();

  // Professeure souhaitée : résolution par nom (insensible aux accents/casse).
  let preferred_teacher_id: string | null = null;
  if (payload.preferred_teacher) {
    const { data: team } = await supabase.from("team_members").select("id, name");
    const want = norm(payload.preferred_teacher);
    preferred_teacher_id =
      team?.find((m) => norm(m.name).includes(want) || want.includes(norm(m.name)))?.id ?? null;
  }

  // Client : on relie un client existant (email ou téléphone) ou on en crée un.
  let client_id: string | null = null;
  if (payload.email || payload.phone) {
    const filters: string[] = [];
    if (payload.email) filters.push(`email.eq.${payload.email}`);
    if (payload.phone) filters.push(`phone.eq.${payload.phone}`);
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .or(filters.join(","))
      .limit(1)
      .maybeSingle();
    if (existing) {
      client_id = existing.id;
    } else {
      const { data: created } = await supabase
        .from("clients")
        .insert({ name: payload.name, email: payload.email, phone: payload.phone })
        .select("id")
        .single();
      client_id = created?.id ?? null;
    }
  }

  const { data, error } = await supabase
    .from("lesson_requests")
    .insert({
      client_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      type: payload.type,
      zone: payload.zone,
      address: payload.address,
      student_name: payload.student_name,
      student_age: payload.student_age,
      student_level: payload.student_level,
      objective: payload.objective,
      weeks: payload.weeks,
      slots_wanted: payload.slots_wanted,
      frequency: payload.frequency,
      duration_min: payload.duration_min,
      nb_courses: payload.nb_courses,
      preferred_teacher_id,
      message: payload.message,
      source,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[intake:insert-error]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}
