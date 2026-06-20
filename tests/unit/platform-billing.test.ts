import { describe, it, expect } from "vitest";
import {
  familyTotalCents,
  teacherPayoutTotalCents,
  isChargeable,
  buildInvoiceLines,
  lessonPriceCents,
  teacherPayoutCents,
} from "@/lib/platform/billing";
import type { LessonDuration, LessonStatus } from "@/lib/supabase/types";

const L = (duration_min: LessonDuration, status: LessonStatus) => ({ duration_min, status });

describe("tarifs & paie", () => {
  it("applique les tarifs client", () => {
    expect(lessonPriceCents(30)).toBe(4000);
    expect(lessonPriceCents(60)).toBe(6500);
  });
  it("applique la paie prof", () => {
    expect(teacherPayoutCents(30)).toBe(2500);
    expect(teacherPayoutCents(60)).toBe(4000);
  });
});

describe("règle d'annulation", () => {
  it("facture les cours faits et annulés < 48h, pas les annulés normaux", () => {
    expect(isChargeable("done")).toBe(true);
    expect(isChargeable("cancelled_late")).toBe(true);
    expect(isChargeable("cancelled")).toBe(false);
    expect(isChargeable("scheduled")).toBe(false);
  });
});

describe("total famille (exemple du brief = 410€)", () => {
  const lessons = [
    ...Array.from({ length: 6 }, () => L(30, "done")),
    ...Array.from({ length: 2 }, () => L(60, "done")),
    L(30, "cancelled_late"),
    L(60, "cancelled"), // annulé normal → non facturé
  ];
  it("calcule 410€", () => {
    expect(familyTotalCents(lessons)).toBe(41000); // 240 + 130 + 40
  });
  it("calcule la paie prof correspondante", () => {
    expect(teacherPayoutTotalCents(lessons)).toBe(25500); // 6×25 + 2×40 + 1×25
  });
  it("construit les lignes de facture", () => {
    const lines = buildInvoiceLines(lessons);
    expect(lines).toContainEqual({ label: "6 cours de 30 min", amount_cents: 24000 });
    expect(lines).toContainEqual({ label: "2 cours d'1 h", amount_cents: 13000 });
    expect(lines.some((l) => l.amount_cents === 4000 && /annulé/.test(l.label))).toBe(true);
  });
});
