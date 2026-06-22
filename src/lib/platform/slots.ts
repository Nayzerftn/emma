/**
 * Proposition automatique de créneaux (brief technique v2 §2.2 étape 2).
 * Calcule les créneaux libres d'une professeure à partir de ses fenêtres de
 * disponibilité, en respectant la règle des 30 min de battement et ses cours
 * déjà planifiés. Tout en heure de Paris (sûr même serveur UTC). PURE / testée.
 */
import { BREAK_MINUTES } from "./planning";

export type AvailWindow = { start: string; end: string }; // "HH:MM"
export type Availability = {
  base: { weekday: number; windows: AvailWindow[] }[]; // weekday 1=lun … 7=dim
  exceptions: { date: string; off?: boolean }[]; // "YYYY-MM-DD"
};
export type BusySlot = { date: string; startMin: number; durationMin: number };
export type ProposedSlot = { date: string; time: string }; // "YYYY-MM-DD", "HH:MM"

const toMin = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + (m || 0);
};
const toHM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** "YYYY-MM-DD" → 1 (lundi) … 7 (dimanche). Midi UTC pour éviter les décalages. */
export function weekdayOf(date: string): number {
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0=dim … 6=sam
  return dow === 0 ? 7 : dow;
}

/** Décale une date "YYYY-MM-DD" de n jours. */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Convertit un instant ISO en { date, startMin } heure de Paris. */
export function toParis(iso: string, durationMin: number): BusySlot {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    startMin: Number(get("hour")) * 60 + Number(get("minute")),
    durationMin,
  };
}

function breakOk(aStart: number, aDur: number, b: BusySlot): boolean {
  const aEnd = aStart + aDur;
  const bEnd = b.startMin + b.durationMin;
  return b.startMin - aEnd >= BREAK_MINUTES || aStart - bEnd >= BREAK_MINUTES;
}

/** Calcule les créneaux libres proposables. */
export function proposeSlots(input: {
  availability: Availability;
  busy: BusySlot[];
  durationMin: number;
  startDate: string; // "YYYY-MM-DD"
  days?: number;
  stepMin?: number;
  max?: number;
}): ProposedSlot[] {
  const { availability, busy, durationMin, startDate, days = 28, stepMin = 30, max = 10 } = input;
  const out: ProposedSlot[] = [];

  for (let i = 0; i < days && out.length < max; i++) {
    const date = addDays(startDate, i);
    if (availability.exceptions?.some((e) => e.date === date && e.off)) continue;
    const day = availability.base?.find((b) => b.weekday === weekdayOf(date));
    if (!day) continue;
    const dayBusy = busy.filter((b) => b.date === date);

    for (const w of day.windows) {
      const ws = toMin(w.start);
      const we = toMin(w.end);
      for (let t = ws; t + durationMin <= we && out.length < max; t += stepMin) {
        if (dayBusy.every((b) => breakOk(t, durationMin, b))) {
          out.push({ date, time: toHM(t) });
        }
      }
    }
  }
  return out;
}
