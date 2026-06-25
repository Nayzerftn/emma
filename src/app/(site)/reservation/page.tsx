import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import { SQUARE_BOOKING_URL, SQUARE_APPOINTMENTS_URL, WHATSAPP, waLink } from "@/lib/constants";
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
            Choisissez votre formule ci-dessous.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        {/* Bassin privé → Square (classes) */}
        <Reveal>
          <div className="border-filet flex h-full flex-col border p-8">
            <Eyebrow className="text-meta">Bassin privé · Bidart</Eyebrow>
            <h2 className="font-display mt-3 text-2xl font-bold">Bassin privé</h2>
            <p className="text-meta mt-3 flex-1 leading-relaxed">
              Enfants en mini-groupes de 3, adultes en individuel. Piscine couverte et chauffée
              à Bidart.
            </p>
            <div className="mt-6">
              <PrimaryCta label="Réserver en bassin privé" href={SQUARE_BOOKING_URL} />
            </div>
          </div>
        </Reveal>

        {/* Domicile & Océan → Square (rendez-vous) */}
        <Reveal delay={0.08}>
          <div className="border-filet flex h-full flex-col border p-8">
            <Eyebrow className="text-meta">Domicile · Océan</Eyebrow>
            <h2 className="font-display mt-3 text-2xl font-bold">À domicile & océan</h2>
            <p className="text-meta mt-3 flex-1 leading-relaxed">
              Cours à domicile et initiation océan, partout sur la Côte Basque. Choisissez votre
              créneau en ligne.
            </p>
            <div className="mt-6">
              <PrimaryCta label="Réserver un rdv à domicile" href={SQUARE_APPOINTMENTS_URL} />
            </div>
          </div>
        </Reveal>

        {/* Kinésiologie & Surf → WhatsApp */}
        <Reveal delay={0.16}>
          <div className="border-filet flex h-full flex-col border p-8">
            <Eyebrow className="text-meta">Kinésiologie · Surf</Eyebrow>
            <h2 className="font-display mt-3 text-2xl font-bold">Kiné & surf</h2>
            <p className="text-meta mt-3 flex-1 leading-relaxed">
              Peur de l'eau ou cours de surf — écrivez directement à la spécialiste sur WhatsApp,
              réponse sous 24h.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <PrimaryCta label={`WhatsApp Maïka — kiné`} href={waLink(WHATSAPP.maika)} />
              <PrimaryCta label={`WhatsApp Clara D. — surf`} href={waLink(WHATSAPP.claraD)} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
