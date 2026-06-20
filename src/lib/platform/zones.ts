/** Secteurs géographiques A→J (carte My Maps Natation Côte Basque). */
export const ZONES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
export type Zone = (typeof ZONES)[number];

/**
 * Adjacence indicative entre secteurs (chaîne par défaut) — à affiner avec la
 * vraie carte des secteurs. Sert au scoring « zone adjacente » du matching.
 */
export const ZONE_ADJACENCY: Record<string, string[]> = {
  A: ["B"],
  B: ["A", "C"],
  C: ["B", "D"],
  D: ["C", "E"],
  E: ["D", "F"],
  F: ["E", "G"],
  G: ["F", "H"],
  H: ["G", "I"],
  I: ["H", "J"],
  J: ["I"],
};

export function isAdjacent(a: string, b: string): boolean {
  return (ZONE_ADJACENCY[a] ?? []).includes(b);
}
