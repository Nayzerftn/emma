"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { HERO_VIDEO_URL } from "@/lib/constants";
import { PHOTOS } from "@/lib/photos";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Eyebrow } from "@/components/site/Typography";

/** Hero accueil : vidéo plein écran (autoplay/muted/loop/playsinline), poster Oïana. */
export function HeroVideo({
  eyebrow,
  titleLines,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  titleLines: readonly string[];
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  // Entrée orchestrée au chargement : eyebrow → lignes du titre → sous-titre → CTA.
  const rise = (i: number) => ({
    // `initial` identique serveur/client (sinon échec d'hydratation) ; `reduce` ne touche que la durée.
    initial: { opacity: 0, y: 28, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: {
      duration: reduce ? 0 : 0.85,
      delay: reduce ? 0 : 0.25 + i * 0.1,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  // Autoplay fiable : on force la propriété DOM `muted` (quirk React) puis play().
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const play = () => void video.play().catch(() => {});
    if (video.readyState >= 2) play();
    else video.addEventListener("canplay", play, { once: true });
    return () => video.removeEventListener("canplay", play);
  }, []);

  return (
    <section
      id="hero-anchor"
      className="bg-ink text-paper relative h-[100svh] min-h-[620px] w-full overflow-hidden"
    >
      <video
        ref={videoRef}
        className="duotone absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={PHOTOS.heroPoster.src}
        aria-hidden
        tabIndex={-1}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/55 to-black/85"
      />

      <div className="shell relative z-10 flex h-full flex-col justify-end pb-16 md:pb-24">
        <motion.div {...rise(0)}>
          <Eyebrow className="text-paper/85">{eyebrow}</Eyebrow>
        </motion.div>
        <h1 className="display text-display text-paper mt-4 max-w-[20ch]">
          {titleLines.map((line, i) => (
            <motion.span key={i} className="block" {...rise(1 + i)}>
              {line}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="text-paper/90 measure mt-6 text-base leading-relaxed md:text-lg"
          {...rise(1 + titleLines.length)}
        >
          {subtitle}
        </motion.p>
        <motion.div className="mt-8" {...rise(2 + titleLines.length)}>
          <Magnetic>
            <Button asChild variant="inverse" size="lg">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
