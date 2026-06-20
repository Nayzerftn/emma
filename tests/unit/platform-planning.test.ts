import { describe, it, expect } from "vitest";
import {
  lessonEndsAt,
  hasSufficientBreak,
  tooClose,
  findConflicts,
  canSchedule,
  type PlanSlot,
} from "@/lib/platform/planning";

const at = (hhmm: string) => new Date(`2026-07-06T${hhmm}:00`);
const slot = (hhmm: string, durationMin: number): PlanSlot => ({ startsAt: at(hhmm), durationMin });

describe("fin de cours", () => {
  it("9:00 + 30 min = 9:30", () => {
    expect(lessonEndsAt(at("09:00"), 30).getTime()).toBe(at("09:30").getTime());
  });
  it("9:00 + 60 min = 10:00", () => {
    expect(lessonEndsAt(at("09:00"), 60).getTime()).toBe(at("10:00").getTime());
  });
});

describe("règle de battement (30 min)", () => {
  it("9:30 → 10:00 = exactement 30 min → ok", () => {
    expect(hasSufficientBreak(at("09:30"), at("10:00"))).toBe(true);
  });
  it("9:30 → 9:45 = 15 min → insuffisant", () => {
    expect(hasSufficientBreak(at("09:30"), at("09:45"))).toBe(false);
  });
});

describe("conflits de planning d'une professeure", () => {
  it("exemple brief : cours 9:00-9:30, prochain au plus tôt 10:00", () => {
    const existing = [slot("09:00", 30)];
    expect(canSchedule(existing, slot("09:45", 30))).toBe(false); // 15 min de battement
    expect(canSchedule(existing, slot("10:00", 30))).toBe(true); // 30 min pile
  });
  it("détecte un chevauchement direct", () => {
    expect(tooClose(slot("09:00", 60), slot("09:30", 30))).toBe(true);
  });
  it("cours d'1 h : 9:00-10:00 → prochain au plus tôt 10:30", () => {
    const existing = [slot("09:00", 60)];
    expect(canSchedule(existing, slot("10:15", 30))).toBe(false);
    expect(canSchedule(existing, slot("10:30", 30))).toBe(true);
  });
  it("liste tous les créneaux en conflit", () => {
    const existing = [slot("09:00", 30), slot("11:00", 30)];
    const conflicts = findConflicts(existing, slot("09:20", 30));
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].startsAt.getTime()).toBe(at("09:00").getTime());
  });
  it("planning vide → toujours planifiable", () => {
    expect(canSchedule([], slot("09:00", 30))).toBe(true);
  });
});
