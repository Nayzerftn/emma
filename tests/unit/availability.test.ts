import { describe, it, expect } from "vitest";
import {
  remainingSeats,
  isSlotFull,
  isSlotPast,
  isSlotBookable,
} from "@/lib/availability";

const future = new Date("2030-01-01T10:00:00Z");
const past = new Date("2020-01-01T10:00:00Z");
const now = new Date("2026-06-16T12:00:00Z");

describe("availability", () => {
  it("calcule les places restantes (jamais négatif)", () => {
    expect(remainingSeats({ capacity: 3, booked_count: 1 })).toBe(2);
    expect(remainingSeats({ capacity: 3, booked_count: 5 })).toBe(0);
  });

  it("détecte un créneau plein", () => {
    expect(isSlotFull({ capacity: 3, booked_count: 3 })).toBe(true);
    expect(isSlotFull({ capacity: 3, booked_count: 2 })).toBe(false);
  });

  it("détecte un créneau passé", () => {
    expect(isSlotPast({ starts_at: past }, now)).toBe(true);
    expect(isSlotPast({ starts_at: future }, now)).toBe(false);
  });

  it("réservable seulement si ouvert, non plein, futur", () => {
    const base = { capacity: 3, booked_count: 0, is_open: true, starts_at: future };
    expect(isSlotBookable(base, now)).toBe(true);
    expect(isSlotBookable({ ...base, is_open: false }, now)).toBe(false);
    expect(isSlotBookable({ ...base, booked_count: 3 }, now)).toBe(false);
    expect(isSlotBookable({ ...base, starts_at: past }, now)).toBe(false);
  });
});
