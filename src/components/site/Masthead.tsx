"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  NAV_LINKS,
  RESERVATION_HREF,
  SQUARE_BOOKING_URL,
  SQUARE_APPOINTMENTS_URL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Masthead minimal : transparent au-dessus d'un hero sombre (#hero-anchor),
 * devient solide (paper + hairline bas) au scroll. Menu plein écran sur mobile.
 */
export function Masthead() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(true);
  const [hasHero, setHasHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const compute = () => {
      const hero = document.getElementById("hero-anchor");
      if (!hero) {
        setHasHero(false);
        setSolid(true);
        return;
      }
      setHasHero(true);
      const threshold = Math.max(hero.offsetHeight - 80, 8);
      setSolid(window.scrollY > threshold);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const overlay = hasHero && !solid && !menuOpen;
  const light = overlay;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          overlay ? "bg-transparent" : "bg-paper/95 border-filet border-b backdrop-blur-sm",
        )}
      >
        <div className="shell flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Natation Côte Basque — accueil"
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full border text-[0.6rem] font-semibold tracking-[0.12em]",
                light ? "border-paper/70 text-paper" : "border-ink text-ink",
              )}
            >
              NCB
            </span>
            <span
              className={cn(
                "font-display hidden text-[0.8rem] font-bold uppercase tracking-[0.02em] sm:block",
                light ? "text-paper" : "text-ink",
              )}
            >
              Natation Côte Basque
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "eyebrow underline-draw transition-opacity hover:opacity-70",
                  light ? "text-paper" : "text-ink",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              asChild
              variant={light ? "inverse" : "primary"}
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href={RESERVATION_HREF}>Réserver</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              className={cn(
                "flex size-10 flex-col items-center justify-center gap-[5px] lg:hidden",
                light ? "text-paper" : "text-ink",
              )}
            >
              <span className="h-[1.5px] w-6 bg-current" />
              <span className="h-[1.5px] w-6 bg-current" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="bg-paper fixed inset-0 z-[60] flex flex-col">
          <div className="shell flex h-16 items-center justify-between md:h-20">
            <span className="border-ink text-ink flex size-9 items-center justify-center rounded-full border text-[0.6rem] font-semibold tracking-[0.12em]">
              NCB
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="text-ink relative flex size-10 items-center justify-center"
            >
              <span className="absolute h-[1.5px] w-6 rotate-45 bg-current" />
              <span className="absolute h-[1.5px] w-6 -rotate-45 bg-current" />
            </button>
          </div>
          <nav className="shell flex flex-1 flex-col justify-center gap-1 pb-16">
            <Link href="/" className="display text-ink py-1 text-2xl">
              Accueil
            </Link>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="display text-ink py-1 text-2xl">
                {l.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild variant="primary" size="lg" className="w-full">
                <a href={SQUARE_APPOINTMENTS_URL} target="_blank" rel="noopener noreferrer">
                  Réserver un rdv à domicile
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href={SQUARE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  Notre bassin privé
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
