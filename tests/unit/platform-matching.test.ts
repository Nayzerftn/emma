import { describe, it, expect } from "vitest";
import {
  scoreTeacher,
  rankTeachers,
  topMatches,
  type MatchTeacher,
  type MatchRequest,
} from "@/lib/platform/matching";

const base: MatchTeacher = {
  id: "t1",
  name: "Oïana",
  services: ["domicile"],
  zones: ["C"],
  hasAvailability: true,
  weekLoad: 0,
  isActive: true,
};
const t = (over: Partial<MatchTeacher>): MatchTeacher => ({ ...base, ...over });

describe("scoreTeacher", () => {
  it("professeure demandée = priorité absolue (domine tout)", () => {
    const req: MatchRequest = { type: "domicile", preferredTeacherId: "t1" };
    const r = scoreTeacher(req, t({ id: "t1" }));
    expect(r.reasons.some((x) => x.includes("demandée"))).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(100);
  });
  it("spécialité correspondante = +15", () => {
    const req: MatchRequest = { type: "domicile" };
    const yes = scoreTeacher(req, t({ services: ["domicile"], hasAvailability: false, weekLoad: 9, zones: [] }));
    const no = scoreTeacher(req, t({ services: ["ocean"], hasAvailability: false, weekLoad: 9, zones: [] }));
    expect(yes.score - no.score).toBe(15);
  });
  it("même secteur = +10, secteur adjacent = +5", () => {
    const req: MatchRequest = { type: "domicile", zone: "C" };
    const same = scoreTeacher(req, t({ zones: ["C"], hasAvailability: false, weekLoad: 9, services: [] }));
    const adj = scoreTeacher(req, t({ zones: ["B"], hasAvailability: false, weekLoad: 9, services: [] }));
    const far = scoreTeacher(req, t({ zones: ["J"], hasAvailability: false, weekLoad: 9, services: [] }));
    expect(same.score).toBe(10);
    expect(adj.score).toBe(5);
    expect(far.score).toBe(0);
  });
  it("disponibilités déclarées = +30", () => {
    const req: MatchRequest = { type: "domicile" };
    const dispo = scoreTeacher(req, t({ hasAvailability: true, weekLoad: 9, zones: [], services: [] }));
    const sans = scoreTeacher(req, t({ hasAvailability: false, weekLoad: 9, zones: [], services: [] }));
    expect(dispo.score - sans.score).toBe(30);
  });
  it("répartition équitable : moins chargée mieux notée", () => {
    const req: MatchRequest = { type: "domicile" };
    const libre = scoreTeacher(req, t({ weekLoad: 0, hasAvailability: false, zones: [], services: [] }));
    const charge = scoreTeacher(req, t({ weekLoad: 5, hasAvailability: false, zones: [], services: [] }));
    expect(libre.score).toBe(3);
    expect(charge.score).toBe(0);
  });
});

describe("classement", () => {
  const teachers = [
    t({ id: "a", name: "A", services: ["ocean"], zones: ["J"], hasAvailability: false, weekLoad: 4 }),
    t({ id: "b", name: "B", services: ["domicile"], zones: ["C"], hasAvailability: true, weekLoad: 1 }),
    t({ id: "c", name: "C", services: ["domicile"], zones: ["B"], hasAvailability: true, weekLoad: 0 }),
    t({ id: "x", name: "X", isActive: false, services: ["domicile"], zones: ["C"], hasAvailability: true }),
  ];
  it("exclut les professeures inactives", () => {
    const ranked = rankTeachers({ type: "domicile", zone: "C" }, teachers);
    expect(ranked.find((r) => r.teacher.id === "x")).toBeUndefined();
  });
  it("classe la mieux adaptée en tête", () => {
    const ranked = rankTeachers({ type: "domicile", zone: "C" }, teachers);
    expect(ranked[0].teacher.id).toBe("b"); // dispo + spécialité + même zone + peu chargée
  });
  it("la professeure demandée passe devant", () => {
    const ranked = rankTeachers({ type: "domicile", zone: "C", preferredTeacherId: "a" }, teachers);
    expect(ranked[0].teacher.id).toBe("a");
  });
  it("topMatches limite à n résultats", () => {
    expect(topMatches({ type: "domicile" }, teachers, 2)).toHaveLength(2);
  });
});
