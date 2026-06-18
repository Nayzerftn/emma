"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HERO_VIDEO_URL } from "@/lib/constants";
import { PHOTOS } from "@/lib/photos";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";

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
        <Eyebrow className="text-paper/85">{eyebrow}</Eyebrow>
        <DisplayTitle
          as="h1"
          lines={titleLines}
          className="text-display text-paper mt-4 max-w-[20ch]"
        />
        <p className="text-paper/90 measure mt-6 text-base leading-relaxed md:text-lg">
          {subtitle}
        </p>
        <div className="mt-8">
          <Magnetic>
            <Button asChild variant="inverse" size="lg">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
