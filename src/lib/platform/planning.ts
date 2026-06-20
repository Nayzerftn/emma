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
