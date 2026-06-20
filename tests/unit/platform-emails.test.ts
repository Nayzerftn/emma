import { describe, it, expect } from "vitest";
import {
  proposalCustomerEmail,
  invoiceCustomerEmail,
  invoiceReminderEmail,
} from "@/lib/email";

describe("Email — proposition de professeure", () => {
  it("contient le nom de la prof, le type et la signature", () => {
    const html = proposalCustomerEmail({ clientName: "Marie", teacherName: "Oïana", type: "ocean" });
    expect(html).toContain("Marie");
    expect(html).toContain("Oïana");
    expect(html).toContain("océan");
    expect(html).toContain("Natation Côte Basque");
  });
});

describe("Email — facture", () => {
  const lines = [
    { label: "6 cours de 30 min", amount_cents: 24000 },
    { label: "2 cours d'1 h", amount_cents: 13000 },
    { label: "1 cours annulé < 48h (30 min)", amount_cents: 4000 },
  ];
  it("liste chaque ligne + total + bouton de paiement", () => {
    const html = invoiceCustomerEmail({
      clientName: "Marie",
      total: "410,00 €",
      url: "https://checkout.stripe.com/x",
      lines,
    });
    for (const l of lines) expect(html).toContain(l.label);
    expect(html).toContain("410,00 €");
    expect(html).toContain("https://checkout.stripe.com/x");
    expect(html).toContain("Régler en ligne");
  });
  it("sans lien Stripe → pas de bouton de paiement", () => {
    const html = invoiceCustomerEmail({ clientName: "Marie", total: "40,00 €", url: null, lines: [lines[0]] });
    expect(html).not.toContain("Régler en ligne");
  });
});

describe("Email — relance", () => {
  it("contient le total et le lien", () => {
    const html = invoiceReminderEmail({ clientName: "Marie", total: "410,00 €", url: "https://pay" });
    expect(html).toContain("410,00 €");
    expect(html).toContain("https://pay");
    expect(html).toContain("Rappel");
  });
});
