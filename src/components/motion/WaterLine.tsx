"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const PATH =
  "M0,20 C100,2 200,38 300,20 C400,2 500,38 600,20 C700,2 800,38 900,20 C1000,2 1100,38 1200,20";

/**
 * « La ligne d'eau » — trait sinueux qui se dessine au scroll (stroke).
 * Sert de séparateur entre les grandes sections.
 */
export function WaterLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "end 55%"],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  // Même rendu serveur/client (sinon échec d'hydratation) : en mouvement réduit,
  // le trait est posé entier après le montage au lieu de suivre le scroll.
  const pathLength = useMotionValue(0);
  useEffect(() => {
    if (reduce) {
      pathLength.set(1);
      return;
    }
    pathLength.set(progress.get());
    return progress.on("change", (v) => pathLength.set(v));
  }, [reduce, progress, pathLength]);

  return (
    <div ref={ref} aria-hidden className={cn("text-filet w-full", className)}>
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="h-6 w-full"
        fill="none"
      >
        <motion.path
          d={PATH}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
}
