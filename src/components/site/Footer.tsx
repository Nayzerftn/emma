import Link from "next/link";
import { CITIES, NAV_LINKS, RESERVATION_HREF, SITE } from "@/lib/constants";

const YEAR = new Date().getFullYear();

/** Footer SEO — fond ink, liens, Instagram, WhatsApp, gros mot-symbole. */
export function Footer() {
  return (
    <footer className="section-ink">
      <div className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="eyebrow">Natation Côte Basque</p>
            <p className="text-paper/70 measure mt-4 leading-relaxed">
              La première école de natation de la Côte Basque. Un collectif de
              maîtres-nageuses diplômées — cours de natation à Bayonne, Anglet, Biarritz
              et Bidart, à domicile, en bassin privé et en océan. Dès 3 ans, enfants et
              adultes.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow underline-draw text-paper"
              >
                Instagram
              </a>
              <Link href={RESERVATION_HREF} className="eyebrow underline-draw text-paper">
                Réserver un cours
              </Link>
            </div>
          </div>

          <nav aria-label="Pages">
            <p className="eyebrow mb-4">Navigation</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-paper/80 underline-draw hover:text-paper">
                  Accueil
                </Link>
              </li>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-paper/80 underline-draw hover:text-paper"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={RESERVATION_HREF}
                  className="text-paper/80 underline-draw hover:text-paper"
                >
                  Réservation
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">Toute la Côte Basque</p>
            <p className="text-paper/70 text-small leading-relaxed">{CITIES.join(" · ")}</p>
          </div>
        </div>

        <div className="border-paper/15 text-paper/50 text-small mt-16 flex flex-col gap-2 border-t pt-6 md:mt-24 md:flex-row md:items-center md:justify-between">
          <span>© {YEAR} Natation Côte Basque — Pays Basque</span>
          <span>Cours de natation · initiation océan · kinésiologie · surf</span>
        </div>
      </div>
    </footer>
  );
}
