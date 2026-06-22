import { describe, it, expect } from "vitest";
import { formatWhenParis } from "@/lib/platform/notify";
import {
  lessonConfirmationEmail,
  lessonCancellationEmail,
  lessonReminderEmail,
  adminAlertEmail,
  teacherNewLessonEmail,
  teacherCancellationEmail,
  teacherDayReminderEmail,
} from "@/lib/email";

describe("formatWhenParis (heure de Paris, sûr en UTC)", () => {
  it("08:00 UTC en été = 10h00 Paris", () => {
    const s = formatWhenParis("2026-07-06T08:00:00Z"); // lundi
    expect(s).toContain("10h00");
    expect(s).toContain("juillet");
    expect(s).toContain("à");
  });
});

describe("Email confirmation de cours", () => {
  it("liste les cours + prof + durées", () => {
    const html = lessonConfirmationEmail({
      clientName: "Marie",
      teacherName: "Oïana",
      lessons: [
        { when: "lundi 6 juillet à 10h00", duration: 30 },
        { when: "mercredi 8 juillet à 11h00", duration: 60 },
      ],
    });
    expect(html).toContain("Oïana");
    expect(html).toContain("lundi 6 juillet à 10h00");
    expect(html).toContain("30 min");
    expect(html).toContain("1 h");
    expect(html).toContain("confirmés");
  });
});

describe("Email annulation", () => {
  it("annulation normale : pas de mention « dû »", () => {
    const html = lessonCancellationEmail({ clientName: "Marie", when: "lundi 6 juillet à 10h00", late: false });
    expect(html).toContain("annulé");
    expect(html).not.toContain("reste dû");
  });
  it("annulation < 48h : mention « ce cours reste dû »", () => {
    const html = lessonCancellationEmail({ clientName: "Marie", when: "lundi 6 juillet à 10h00", late: true });
    expect(html).toContain("reste dû");
  });
});

describe("Email rappel J-1", () => {
  it("contient demain, créneau, prof, maillot", () => {
    const html = lessonReminderEmail({ clientName: "Marie", when: "demain à 10h00", teacherName: "Oïana" });
    expect(html).toContain("Oïana");
    expect(html).toContain("maillot");
  });
});

describe("Email alerte Eléa", () => {
  it("rend toutes les lignes", () => {
    const html = adminAlertEmail("Demandes à traiter", ["3 demandes non traitées", "1 sans match"]);
    expect(html).toContain("3 demandes non traitées");
    expect(html).toContain("1 sans match");
    expect(html).toContain("Demandes à traiter");
  });
});

describe("Emails professeure", () => {
  it("nouveau cours : prof, créneau, élève, secteur, tél parent", () => {
    const html = teacherNewLessonEmail({
      teacherName: "Oïana",
      lessons: [{ when: "lundi 6 juillet à 10h00", duration: 30, student: "Léa", zone: "C", phone: "0612345678" }],
    });
    expect(html).toContain("Oïana");
    expect(html).toContain("lundi 6 juillet à 10h00");
    expect(html).toContain("Léa");
    expect(html).toContain("secteur C");
    expect(html).toContain("0612345678");
    expect(html).toContain("Nouveau cours");
  });
  it("plusieurs cours → pluriel", () => {
    const html = teacherNewLessonEmail({
      teacherName: "Clara",
      lessons: [{ when: "a", duration: 30 }, { when: "b", duration: 60 }],
    });
    expect(html).toContain("Nouveaux cours");
  });
  it("annulation prof : créneau + élève", () => {
    const html = teacherCancellationEmail({ teacherName: "Thaïs", when: "mardi 7 juillet à 14h00", student: "Tom" });
    expect(html).toContain("mardi 7 juillet à 14h00");
    expect(html).toContain("Tom");
    expect(html).toContain("annulé");
  });
  it("rappel veille prof : liste des cours", () => {
    const html = teacherDayReminderEmail({
      teacherName: "Audrey",
      lessons: [{ when: "demain 9h00", student: "Mateo", zone: "B" }],
    });
    expect(html).toContain("Mateo");
    expect(html).toContain("demain");
  });
});
