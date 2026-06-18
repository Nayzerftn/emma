"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
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
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

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
          style={{ pathLength: reduce ? 1 : pathLength }}
        />
      </svg>
    </div>
  );
}
