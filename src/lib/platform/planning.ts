/**
 * Planning (brief technique v2 §3) — règle de battement + détection de conflits.
 * Règle absolue : 30 min minimum entre deux cours d'une même professeure.
 * Fonctions PURES — testées unitairement.
 */
export const BREAK_MINUTES = 30;

export type PlanSlot = { startsAt: Date; durationMin: number };

export function lessonEndsAt(startsAt: Date, durationMin: number): Date {
  return new Date(startsAt.getTime() + durationMin * 60_000);
}

/** Y a-t-il au moins 30 min entre la fin d'un cours et le début du suivant ? */
export function hasSufficientBreak(prevEnd: Date, nextStart: Date): boolean {
  return nextStart.getTime() - prevEnd.getTime() >= BREAK_MINUTES * 60_000;
}

/** Deux créneaux se chevauchent-ils OU sont-ils trop rapprochés (< 30 min) ? */
export function tooClose(a: PlanSlot, b: PlanSlot): boolean {
  const aEnd = lessonEndsAt(a.startsAt, a.durationMin);
  const bEnd = lessonEndsAt(b.startsAt, b.durationMin);
  const aThenB = hasSufficientBreak(aEnd, b.startsAt);
  const bThenA = hasSufficientBreak(bEnd, a.startsAt);
  return !(aThenB || bThenA);
}

/** Conflits d'un créneau candidat avec des créneaux existants. */
export function findConflicts(existing: PlanSlot[], candidate: PlanSlot): PlanSlot[] {
  return existing.filter((e) => tooClose(e, candidate));
}

/** Peut-on planifier ce créneau sans violer le battement ? */
export function canSchedule(existing: PlanSlot[], candidate: PlanSlot): boolean {
  return findConflicts(existing, candidate).length === 0;
}

/**
 * Minute du jour (ex. 9h30 → 570), snappée au pas voulu, pour un glisser-déposer
 * lâché à `offsetY` pixels depuis le haut de la grille semaine.
 * Borné à [startHour, endHour] pour éviter de sortir de la grille.
 */
export function snapDropMinutes(
  offsetY: number,
  opts: { pxPerMin: number; startHour: number; endHour: number; step?: number },
): number {
  const { pxPerMin, startHour, endHour, step = 30 } = opts;
  const startMin = startHour * 60;
  const raw = startMin + offsetY / pxPerMin;
  const snapped = Math.round(raw / step) * step;
  return Math.max(startMin, Math.min(endHour * 60 - step, snapped));
}

/**
 * Liste des dates (YYYY-MM-DD, fuseau Europe/Paris) couvertes par un intervalle
 * d'instants ISO, bornes incluses. Sert à marquer une prof indisponible sur une
 * période (redistribution en masse). PURE — testée unitairement.
 */
export function eachDateParis(fromISO: string, toISO: string): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // Bornes = dates *calendaires* en heure de Paris.
  const startStr = fmt.format(new Date(fromISO));
  const endStr = fmt.format(new Date(toISO));
  // Curseur ancré à midi UTC : stable (pas de bascule de fuseau) et la portion
  // YYYY-MM-DD reste la date calendaire voulue.
  const cur = new Date(`${startStr}T12:00:00Z`);
  const end = new Date(`${endStr}T12:00:00Z`).getTime();
  const out: string[] = [];
  for (let i = 0; i < 366 && cur.getTime() <= end; i++) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}
