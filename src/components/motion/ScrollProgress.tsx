"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barre de progression de lecture en haut de page (déclinaison « ligne d'eau »). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="bg-ink fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
    />
  );
}
