import { describe, it, expect } from "vitest";
import { normalizeIntake } from "@/lib/platform/intake";

describe("normalizeIntake — libellés Google Form (français, avec accents)", () => {
  it("mappe les libellés réels d'un formulaire", () => {
    const p = normalizeIntake({
      "Nom et prénom": "Sophie Martin",
      "Adresse e-mail": "sophie@example.com",
      Téléphone: "06 12 34 56 78",
      "Type de cours": "Cours à domicile",
      Secteur: "Zone C — Bidart",
      Adresse: "12 rue des Vagues, Bidart",
      "Prénom de l'enfant": "Léa",
      "Âge de l'enfant": "7 ans",
      Niveau: "débutante",
      Objectif: "Perdre la peur de l'eau",
      "Période souhaitée": "Juillet",
      "Créneaux souhaités": "Matins en semaine",
      Fréquence: "2 fois par semaine",
      "Durée du cours": "30 min",
      "Nombre de cours": "8 cours",
      "Professeure souhaitée": "Oïana",
      Commentaire: "Merci !",
    });
    expect(p.name).toBe("Sophie Martin");
    expect(p.email).toBe("sophie@example.com");
    expect(p.phone).toBe("06 12 34 56 78");
    expect(p.type).toBe("domicile");
    expect(p.zone).toBe("C");
    expect(p.student_name).toBe("Léa");
    expect(p.student_age).toBe(7);
    expect(p.student_level).toBe("débutante");
    expect(p.objective).toBe("Perdre la peur de l'eau");
    expect(p.duration_min).toBe(30);
    expect(p.nb_courses).toBe(8);
    expect(p.preferred_teacher).toBe("Oïana");
    expect(p.message).toBe("Merci !");
  });

  it("déduit le type océan et la durée 1h", () => {
    const p = normalizeIntake({ Nom: "X", "Type de cours": "Initiation océan", Durée: "1h" });
    expect(p.type).toBe("ocean");
    expect(p.duration_min).toBe(60);
  });

  it("défauts robustes : domicile, 30 min, nom de repli", () => {
    const p = normalizeIntake({ email: "a@b.com" });
    expect(p.type).toBe("domicile");
    expect(p.duration_min).toBe(30);
    expect(p.name).toBe("Demande sans nom");
    expect(p.zone).toBeNull();
  });

  it("rejette une zone hors A-J", () => {
    expect(normalizeIntake({ Secteur: "Zone Z" }).zone).toBeNull();
    expect(normalizeIntake({ Secteur: "A" }).zone).toBe("A");
  });

  it("ignore les champs vides", () => {
    const p = normalizeIntake({ Nom: "Y", Commentaire: "", Téléphone: "   " });
    expect(p.name).toBe("Y");
    expect(p.message).toBeNull();
    expect(p.phone).toBeNull();
  });
});
