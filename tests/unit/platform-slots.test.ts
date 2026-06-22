import { describe, it, expect } from "vitest";
import { proposeSlots, weekdayOf, addDays, toParis, type Availability } from "@/lib/platform/slots";

const avail: Availability = {
  base: [{ weekday: 1, windows: [{ start: "09:00", end: "12:00" }] }], // lundi 9h-12h
  exceptions: [],
};

describe("helpers date", () => {
  it("weekdayOf : 2026-07-06 = lundi (1)", () => expect(weekdayOf("2026-07-06")).toBe(1));
  it("weekdayOf : 2026-07-12 = dimanche (7)", () => expect(weekdayOf("2026-07-12")).toBe(7));
  it("addDays", () => expect(addDays("2026-07-06", 7)).toBe("2026-07-13"));
  it("toParis : 08:00 UTC été = 10:00 Paris", () => {
    const b = toParis("2026-07-06T08:00:00Z", 30);
    expect(b.date).toBe("2026-07-06");
    expect(b.startMin).toBe(600); // 10h00
  });
});

describe("proposeSlots", () => {
  it("propose des créneaux de 30 min dans la fenêtre du lundi", () => {
    const slots = proposeSlots({ availability: avail, busy: [], durationMin: 30, startDate: "2026-07-06", days: 1 });
    // 9:00 → 11:30 par pas de 30 (dernier départ 11:30 pour finir à 12:00)
    expect(slots.map((s) => s.time)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
    expect(slots.every((s) => s.date === "2026-07-06")).toBe(true);
  });
  it("respecte le battement vs un cours existant (9:00-9:30 → pas avant 10:00)", () => {
    const busy = [{ date: "2026-07-06", startMin: 540, durationMin: 30 }]; // 9:00-9:30
    const slots = proposeSlots({ availability: avail, busy, durationMin: 30, startDate: "2026-07-06", days: 1 });
    expect(slots.map((s) => s.time)).not.toContain("09:30"); // <30 min
    expect(slots.map((s) => s.time)).toContain("10:00"); // 30 min pile
  });
  it("ignore les jours sans disponibilité + les exceptions off", () => {
    const a2: Availability = { ...avail, exceptions: [{ date: "2026-07-06", off: true }] };
    const slots = proposeSlots({ availability: a2, busy: [], durationMin: 30, startDate: "2026-07-06", days: 1 });
    expect(slots).toHaveLength(0);
  });
  it("respecte la durée 1h (dernier départ 11:00)", () => {
    const slots = proposeSlots({ availability: avail, busy: [], durationMin: 60, startDate: "2026-07-06", days: 1 });
    expect(slots.map((s) => s.time)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
  });
  it("limite au max demandé", () => {
    const slots = proposeSlots({ availability: avail, busy: [], durationMin: 30, startDate: "2026-07-06", days: 7, max: 3 });
    expect(slots).toHaveLength(3);
  });
});
