"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PhotoSlot } from "@/lib/photos";

/** Watermark NCB — petit cercle blanc discret en coin (logo). */
function Watermark() {
  return (
    <span
      aria-hidden
      className="absolute right-4 bottom-4 z-20 flex size-11 items-center justify-center rounded-full border border-white/80 text-[0.6rem] font-semibold tracking-[0.14em] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]"
    >
      NCB
    </span>
  );
}

function Placeholder({ alt }: { alt: string }) {
  return (
    <div className="bg-sand absolute inset-0 flex items-center justify-center">
      <span className="border-meta/40 text-meta/70 flex size-16 items-center justify-center rounded-full border text-[0.7rem] font-semibold tracking-[0.14em]">
        NCB
      </span>
      <span className="sr-only">{alt}</span>
    </div>
  );
}

type Props = {
  slot: PhotoSlot;
  className?: string;
  sizes?: string;
  priority?: boolean;
  hoverZoom?: boolean;
  caption?: string;
  /** Voile sombre par-dessus la photo (texte par-dessus). */
  scrim?: boolean;
};

/**
 * Photo éditoriale : N&B duotone, plein cadre, watermark NCB, zoom au survol.
 * Si le fichier manque, affiche un placeholder propre (swap instantané au drop-in).
 */
export function EditorialImage({
  slot,
  className,
  sizes = "100vw",
  priority = false,
  hoverZoom = false,
  caption,
  scrim = false,
}: Props) {
  const [errored, setErrored] = useState(false);

  return (
    <figure className={cn("group bg-sand relative overflow-hidden", className)}>
      {errored ? (
        <Placeholder alt={slot.alt} />
      ) : (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErrored(true)}
          style={{ objectPosition: slot.position ?? "center" }}
          className={cn(
            "duotone object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
            hoverZoom && "group-hover:scale-[1.03]",
          )}
        />
      )}

      {scrim && (
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-black/10 to-black/25"
        />
      )}

      <Watermark />

      {caption && (
        <figcaption className="eyebrow absolute bottom-4 left-4 z-20 max-w-[80%] text-white/90 opacity-90 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
