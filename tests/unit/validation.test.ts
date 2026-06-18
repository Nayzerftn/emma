import { describe, it, expect } from "vitest";
import { leadSchema } from "@/lib/validation/lead";
import { bookingSchema } from "@/lib/validation/booking";

describe("leadSchema", () => {
  const valid = {
    type: "domicile",
    name: "Sophie",
    email: "sophie@example.com",
    phone: "0612345678",
    city: "Anglet",
  };

  it("accepte un lead valide", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });
  it("rejette un email invalide", () => {
    expect(leadSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });
  it("rejette un nom trop court", () => {
    expect(leadSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
  it("rejette un type hors enum", () => {
    expect(leadSchema.safeParse({ ...valid, type: "surf" }).success).toBe(false);
  });
  it("accepte les champs optionnels vides", () => {
    const res = leadSchema.safeParse({ ...valid, address: "", message: "" });
    expect(res.success).toBe(true);
  });
});

describe("bookingSchema", () => {
  const valid = {
    slotId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    customerName: "Thomas",
    customerEmail: "thomas@example.com",
    customerPhone: "0612345678",
    participantName: "Léo",
  };

  it("accepte une réservation valide", () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true);
  });
  it("rejette un slotId non-uuid", () => {
    expect(bookingSchema.safeParse({ ...valid, slotId: "abc" }).success).toBe(false);
  });
  it("coerce l'âge depuis une chaîne", () => {
    const res = bookingSchema.safeParse({ ...valid, participantAge: "7" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.participantAge).toBe(7);
  });
  it("rejette un email client invalide", () => {
    expect(bookingSchema.safeParse({ ...valid, customerEmail: "x" }).success).toBe(false);
  });
});
