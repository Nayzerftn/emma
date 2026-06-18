import { describe, it, expect } from "vitest";
import { nextBookingStatus, shouldConfirmSeat } from "@/lib/webhook";

describe("nextBookingStatus", () => {
  it("paye sur checkout.session.completed", () => {
    expect(nextBookingStatus("checkout.session.completed", "pending")).toBe("paid");
  });
  it("échoue sur expired / payment_failed", () => {
    expect(nextBookingStatus("checkout.session.expired", "pending")).toBe("failed");
    expect(nextBookingStatus("payment_intent.payment_failed", "pending")).toBe("failed");
  });
  it("est idempotent : déjà payée reste payée", () => {
    expect(nextBookingStatus("checkout.session.expired", "paid")).toBe("paid");
    expect(nextBookingStatus("checkout.session.completed", "paid")).toBe("paid");
  });
  it("ignore un événement inconnu", () => {
    expect(nextBookingStatus("invoice.created", "pending")).toBe("pending");
  });
});

describe("shouldConfirmSeat", () => {
  it("confirme une place sur paiement d'une résa non encore payée", () => {
    expect(shouldConfirmSeat("checkout.session.completed", "pending")).toBe(true);
  });
  it("ne reconfirme pas une résa déjà payée (idempotence capacité)", () => {
    expect(shouldConfirmSeat("checkout.session.completed", "paid")).toBe(false);
  });
});
