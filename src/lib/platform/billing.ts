/**
 * Comptabilité (brief technique v2 §4) — tarifs, paie professeures, totaux.
 * Tout en centimes. Fonctions PURES — testées unitairement.
 *
 * Tarifs client : 30 min = 40 € · 1 h = 65 €
 * Paie prof : 30 min = 25 € · 1 h = 40 €
 * Règle d'annulation : cours annulé < 48h = dû et comptabilisé.
 */
import type { LessonDuration, LessonStatus, InvoiceLine } from "@/lib/supabase/types";

export const LESSON_PRICE_CENTS: Record<LessonDuration, number> = { 30: 4000, 60: 6500 };
export const TEACHER_PAYOUT_CENTS: Record<LessonDuration, number> = { 30: 2500, 60: 4000 };

/** Un cours est facturé s'il a eu lieu ou a été annulé tardivement (< 48h). */
export function isChargeable(status: LessonStatus): boolean {
  return status === "done" || status === "cancelled_late";
}

export function lessonPriceCents(duration: LessonDuration): number {
  return LESSON_PRICE_CENTS[duration];
}

export function teacherPayoutCents(duration: LessonDuration): number {
  return TEACHER_PAYOUT_CENTS[duration];
}

type Billable = { duration_min: LessonDuration; status: LessonStatus };

export function familyTotalCents(lessons: Billable[]): number {
  return lessons
    .filter((l) => isChargeable(l.status))
    .reduce((sum, l) => sum + lessonPriceCents(l.duration_min), 0);
}

export function teacherPayoutTotalCents(lessons: Billable[]): number {
  return lessons
    .filter((l) => isChargeable(l.status))
    .reduce((sum, l) => sum + teacherPayoutCents(l.duration_min), 0);
}

/** Construit les lignes de facture regroupées par durée + cours annulés tardifs. */
export function buildInvoiceLines(
  lessons: { duration_min: LessonDuration; status: LessonStatus }[],
): InvoiceLine[] {
  const done30 = lessons.filter((l) => l.status === "done" && l.duration_min === 30).length;
  const done60 = lessons.filter((l) => l.status === "done" && l.duration_min === 60).length;
  const late = lessons.filter((l) => l.status === "cancelled_late");
  const lines: InvoiceLine[] = [];
  if (done30)
    lines.push({ label: `${done30} cours de 30 min`, amount_cents: done30 * 4000 });
  if (done60) lines.push({ label: `${done60} cours d'1 h`, amount_cents: done60 * 6500 });
  for (const l of late)
    lines.push({
      label: `1 cours annulé < 48h (${l.duration_min} min)`,
      amount_cents: lessonPriceCents(l.duration_min),
    });
  return lines;
}
