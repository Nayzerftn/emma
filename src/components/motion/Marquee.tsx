"use client";

import { motion, useReducedMotion } from "motion/react";

/** Ticker horizontal en boucle douce (villes Pays Basque). */
export function Marquee({
  items,
  durationSeconds = 38,
}: {
  items: readonly string[];
  durationSeconds?: number;
}) {
  const reduce = useReducedMotion();
  const doubled = [...items, ...items];

  const Row = (
    <div className="flex shrink-0 items-center">
      {doubled.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display px-8 text-2xl font-semibold uppercase tracking-[0.04em] md:text-4xl">
            {item}
          </span>
          <span className="text-meta/50" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </div>
  );

  // Même markup serveur/client (sinon échec d'hydratation) : en mouvement réduit, le ruban reste fixe.
  return (
    <div className="overflow-hidden" aria-label="Villes desservies">
      <motion.div
        className="flex w-max"
        animate={reduce ? { x: "0%" } : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: durationSeconds, ease: "linear", repeat: Infinity }
        }
      >
        {Row}
        {Row}
      </motion.div>
    </div>
  );
}
