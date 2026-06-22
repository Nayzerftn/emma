import { describe, it, expect } from "vitest";
import {
  lessonEndsAt,
  hasSufficientBreak,
  tooClose,
  findConflicts,
  canSchedule,
  snapDropMinutes,
  eachDateParis,
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

describe("glisser-déposer : snap du créneau (grille semaine)", () => {
  // 28px par 30 min → pxPerMin = 28/30 ; grille 8h→20h.
  const opts = { pxPerMin: 28 / 30, startHour: 8, endHour: 20 };
  it("haut de grille (offset 0) → 8h00 = 480 min", () => {
    expect(snapDropMinutes(0, opts)).toBe(480);
  });
  it("une tranche plus bas (28px) → 8h30 = 510 min", () => {
    expect(snapDropMinutes(28, opts)).toBe(510);
  });
  it("arrondit au pas de 30 min le plus proche", () => {
    expect(snapDropMinutes(40, opts)).toBe(510); // ~8h43 → 8h30
    expect(snapDropMinutes(50, opts)).toBe(540); // ~8h54 → 9h00
  });
  it("borne en haut : offset négatif → ne descend pas sous 8h00", () => {
    expect(snapDropMinutes(-100, opts)).toBe(480);
  });
  it("borne en bas : offset énorme → dernier créneau (19h30 = 1170)", () => {
    expect(snapDropMinutes(99999, opts)).toBe(20 * 60 - 30);
  });
});

describe("eachDateParis (redistribution : dates d'indisponibilité)", () => {
  it("intervalle d'un jour → une seule date", () => {
    const d = eachDateParis("2026-07-06T00:00:00+02:00", "2026-07-06T23:59:59+02:00");
    expect(d).toEqual(["2026-07-06"]);
  });
  it("intervalle de 3 jours → 3 dates consécutives", () => {
    const d = eachDateParis("2026-07-06T00:00:00+02:00", "2026-07-08T23:59:59+02:00");
    expect(d).toEqual(["2026-07-06", "2026-07-07", "2026-07-08"]);
  });
  it("rend des dates en heure de Paris (été = UTC+2)", () => {
    // 2026-07-05T23:30Z = 6 juillet 01h30 à Paris → doit compter le 6, pas le 5.
    const d = eachDateParis("2026-07-05T23:30:00Z", "2026-07-06T10:00:00Z");
    expect(d[0]).toBe("2026-07-06");
  });
  it("dédoublonne et borne (garde-fou ≤ 366)", () => {
    const d = eachDateParis("2026-01-01T00:00:00Z", "2027-12-31T00:00:00Z");
    expect(d.length).toBeLessThanOrEqual(366);
    expect(new Set(d).size).toBe(d.length);
  });
});
