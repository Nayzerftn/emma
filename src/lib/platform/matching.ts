/**
 * Algorithme de matching (brief technique v2 §2).
 * Pour une demande, score chaque professeure et classe les meilleures.
 * Fonction PURE — testée unitairement.
 *
 * Pondération :
 *  - Professeure demandée par le client → +100 (priorité absolue : domine
 *    toujours toute autre combinaison, dont le maximum est 30+15+10+3 = 58)
 *  - Disponibilités déclarées → +30
 *  - Spécialité correspondante (type de cours) → +15
 *  - Zone : même secteur → +10, secteur adjacent → +5
 *  - Répartition équitable : moins chargée → jusqu'à +3
 *
 * NB : le matching fin créneau-par-créneau nécessite des créneaux structurés
 * (les créneaux du Google Form sont en texte libre) — évolution future.
 */
import type { Service } from "@/lib/content/team";
import { isAdjacent } from "./zones";

export type MatchTeacher = {
  id: string;
  name: string;
  services: Service[];
  zones: string[];
  hasAvailability: boolean;
  weekLoad: number;
  isActive: boolean;
};

export type MatchRequest = {
  type: "domicile" | "ocean";
  zone?: string | null;
  preferredTeacherId?: string | null;
};

export type MatchResult = { teacher: MatchTeacher; score: number; reasons: string[] };

export function scoreTeacher(req: MatchRequest, t: MatchTeacher): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  if (req.preferredTeacherId && t.id === req.preferredTeacherId) {
    score += 100;
    reasons.push("Professeure demandée (priorité absolue)");
  }
  if (t.hasAvailability) {
    score += 30;
    reasons.push("Disponibilités déclarées (+30)");
  }
  if (t.services.includes(req.type as Service)) {
    score += 15;
    reasons.push("Spécialité correspondante (+15)");
  }
  if (req.zone) {
    if (t.zones.includes(req.zone)) {
      score += 10;
      reasons.push("Même secteur (+10)");
    } else if (t.zones.some((z) => isAdjacent(z, req.zone as string))) {
      score += 5;
      reasons.push("Secteur adjacent (+5)");
    }
  }
  const loadBonus = Math.max(0, 3 - t.weekLoad);
  if (loadBonus > 0) {
    score += loadBonus;
    reasons.push(`Peu chargée (+${loadBonus})`);
  }

  return { teacher: t, score, reasons };
}

export function rankTeachers(req: MatchRequest, teachers: MatchTeacher[]): MatchResult[] {
  return teachers
    .filter((t) => t.isActive)
    .map((t) => scoreTeacher(req, t))
    .sort((a, b) => b.score - a.score);
}

export function topMatches(
  req: MatchRequest,
  teachers: MatchTeacher[],
  n = 3,
): MatchResult[] {
  return rankTeachers(req, teachers).slice(0, n);
}
