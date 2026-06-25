import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import { SQUARE_BOOKING_URL, SQUARE_APPOINTMENTS_URL, POOL_ADDRESS } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("reservation");

export default function ReservationPage() {
  return (
    <section className="shell pt-28 pb-20 md:pt-36 md:pb-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="mb-3">Réservation · Natation Côte Basque</Eyebrow>
          <DisplayTitle as="h1" lines={["On se", "lance ?"]} className="text-h1" />
          <p className="text-meta mx-auto mt-6 max-w-xl text-lg leading-relaxed">
            Réservez en ligne en quelques clics. Choisissez votre formule ci-dessous.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Bassin privé → Square (classes) */}
        <Reveal>
          <div className="border-filet flex h-full flex-col border p-8">
            <Eyebrow className="text-meta">Bassin privé · Bidart</Eyebrow>
            <h2 className="font-display mt-3 text-2xl font-bold">Cours en bassin privé</h2>
            <p className="text-meta mt-3 flex-1 leading-relaxed">
              Enfants en mini-groupes de 3, adultes en individuel. Piscine couverte et chauffée.
              {" "}
              {POOL_ADDRESS.full}
            </p>
            <div className="mt-6">
              <PrimaryCta label="Réserver en bassin privé" href={SQUARE_BOOKING_URL} />
            </div>
          </div>
        </Reveal>

        {/* Domicile / Océan / Kiné / Surf → Square (rendez-vous) */}
        <Reveal delay={0.08}>
          <div className="border-filet flex h-full flex-col border p-8">
            <Eyebrow className="text-meta">Domicile · Océan · Kiné · Surf</Eyebrow>
            <h2 className="font-display mt-3 text-2xl font-bold">Cours sur rendez-vous</h2>
            <p className="text-meta mt-3 flex-1 leading-relaxed">
              Cours à domicile, initiation océan, kinésiologie et surf — partout sur la Côte
              Basque. Choisissez votre créneau directement en ligne.
            </p>
            <div className="mt-6">
              <PrimaryCta label="Réserver un rendez-vous" href={SQUARE_APPOINTMENTS_URL} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
