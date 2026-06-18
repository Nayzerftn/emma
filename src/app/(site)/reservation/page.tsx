import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import { LeadForm } from "@/components/site/LeadForm";
import { WHATSAPP, waLink } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("reservation");

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === "ocean" ? "ocean" : "domicile";

  return (
    <>
      {/* Formulaire en avant — première section */}
      <section id="en-ligne" className="shell scroll-mt-24 pt-28 pb-16 md:pt-36 md:pb-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">En ligne · réponse 24h</Eyebrow>
            <DisplayTitle
              as="h1"
              lines={["Cours de natation", "& initiation océan."]}
              className="text-h1"
            />
            <p className="text-meta mx-auto mt-6 max-w-xl text-lg leading-relaxed">
              Indiquez votre niveau, vos disponibilités et votre adresse. On vous
              recontacte avec la professeure la plus adaptée et des propositions de
              créneaux.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-12 max-w-4xl">
          <LeadForm initialType={initialType} />
        </div>
      </section>

      {/* Kinésiologie & surf — WhatsApp */}
      <section id="whatsapp" className="bg-sand scroll-mt-24 py-16 md:py-24">
        <div className="shell">
          <Eyebrow className="mb-3">WhatsApp</Eyebrow>
          <DisplayTitle lines={["Kinésiologie", "& surf."]} className="text-h2" />
          <p className="measure text-meta mt-6 leading-relaxed">
            Pour la kinésiologie, le surf ou toute autre question — écrivez-nous sur
            WhatsApp. On préfère l'écrit pour prendre le temps de bien vous répondre,
            toujours sous 24h.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryCta
              label={`WhatsApp Maïka — ${WHATSAPP.maika.phone}`}
              href={waLink(WHATSAPP.maika)}
            />
            <PrimaryCta
              label={`WhatsApp Clara D. — ${WHATSAPP.claraD.phone}`}
              href={waLink(WHATSAPP.claraD)}
            />
            <PrimaryCta
              label={`WhatsApp — ${WHATSAPP.general.phone}`}
              href={waLink(WHATSAPP.general)}
            />
          </div>
        </div>
      </section>
    </>
  );
}
