import { describe, it, expect } from "vitest";
import { bookingAmountCents, perChildCost } from "@/lib/pricing";

describe("bookingAmountCents", () => {
  it("retourne le prix du créneau pour une place", () => {
    expect(bookingAmountCents(4500)).toBe(4500);
  });
  it("multiplie par la quantité", () => {
    expect(bookingAmountCents(4500, 2)).toBe(9000);
  });
  it("rejette un prix négatif ou non entier", () => {
    expect(() => bookingAmountCents(-1)).toThrow();
    expect(() => bookingAmountCents(10.5)).toThrow();
  });
  it("rejette une quantité invalide", () => {
    expect(() => bookingAmountCents(4500, 0)).toThrow();
  });
});

describe("perChildCost (partage de frais domicile)", () => {
  it("divise et arrondit", () => {
    expect(perChildCost(4500, 3)).toBe(1500);
    expect(perChildCost(4400, 3)).toBe(1467);
  });
  it("reste sous 15€ pour 3 enfants à 45€", () => {
    expect(perChildCost(4500, 3)).toBeLessThan(1500 + 1);
  });
  it("borne le partage à 1–3 enfants", () => {
    expect(() => perChildCost(4500, 0)).toThrow();
    expect(() => perChildCost(4500, 4)).toThrow();
  });
});
