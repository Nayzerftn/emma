import { describe, it, expect } from "vitest";
import { waFromPhone, waLink, proposalMessage, reminderMessage } from "@/lib/platform/notify";

describe("WhatsApp — normalisation numéro FR", () => {
  it("0612345678 → 33612345678", () => {
    expect(waFromPhone("0612345678")).toBe("33612345678");
  });
  it("+33 6 12 34 56 78 → 33612345678", () => {
    expect(waFromPhone("+33 6 12 34 56 78")).toBe("33612345678");
  });
  it("612345678 (9 chiffres, sans 0) → 33612345678", () => {
    expect(waFromPhone("612345678")).toBe("33612345678");
  });
});

describe("WhatsApp — lien pré-rempli", () => {
  it("sans texte", () => {
    expect(waLink("0612345678")).toBe("https://wa.me/33612345678");
  });
  it("avec texte encodé", () => {
    const link = waLink("0612345678", "Bonjour Léa");
    expect(link.startsWith("https://wa.me/33612345678?text=")).toBe(true);
    expect(link).toContain("Bonjour%20L%C3%A9a");
  });
});

describe("Messages pré-remplis", () => {
  it("proposition océan inclut prof, élève, type", () => {
    const m = proposalMessage({ clientName: "Marie", teacherName: "Oïana", studentName: "Léa", type: "ocean" });
    expect(m).toContain("Marie");
    expect(m).toContain("Oïana");
    expect(m).toContain("Léa");
    expect(m).toContain("océan");
  });
  it("proposition domicile sans élève", () => {
    const m = proposalMessage({ clientName: "Peio", teacherName: "Clara", type: "domicile" });
    expect(m).toContain("domicile");
    expect(m).not.toContain("undefined");
  });
  it("relance inclut total + lien", () => {
    const m = reminderMessage({ clientName: "Marie", total: "410,00 €", url: "https://pay" });
    expect(m).toContain("410,00 €");
    expect(m).toContain("https://pay");
  });
});
