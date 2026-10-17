"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Flou d'apparition en px (0 pour désactiver). Touche premium « clean ». */
  blur?: number;
};

/**
 * Révélation au scroll : fade + translateY + léger flou. Respecte prefers-reduced-motion.
 * Le markup est identique serveur/client (sinon l'hydratation garde opacity:0 et la
 * section reste invisible) : en mouvement réduit, seule la transition devient instantanée.
 */
export function Reveal({ children, className, delay = 0, y = 28, blur = 6 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? `blur(${blur}px)` : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
