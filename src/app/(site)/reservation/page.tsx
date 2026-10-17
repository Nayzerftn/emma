import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import { CtaBlock, FaqSection } from "@/components/site/blocks";
import { RESERVATION } from "@/lib/content/reservation";
import { getFaq } from "@/lib/content/resolvers";
import { faqPageLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("reservation");
export const revalidate = 3600;

export default async function ReservationPage() {
  const faq = await getFaq("reservation");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(faq)) }}
      />

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

        {/* 3 chemins : en ligne (domicile / océan), en ligne (bassins), WhatsApp */}
        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
          {RESERVATION.paths.map((path, i) => (
            <Reveal key={path.id} delay={i * 0.08}>
              <div
                id={path.id}
                className="border-filet flex h-full scroll-mt-28 flex-col border p-8"
              >
                <Eyebrow className="text-meta">{path.eyebrow}</Eyebrow>
                <h2 className="font-display mt-3 text-2xl font-bold">{path.title}</h2>
                <p className="text-meta mt-3 flex-1 leading-relaxed">{path.text}</p>
                <div className="mt-6 flex flex-col gap-3">
                  {path.buttons.map((b) => (
                    <PrimaryCta key={b.label} label={b.label} href={b.href} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FaqSection items={faq} titleLines={["Vos questions,", "nos réponses."]} />

      <CtaBlock
        titleLines={RESERVATION.finalCta.titleLines}
        text={RESERVATION.finalCta.text}
        buttons={RESERVATION.finalCta.buttons}
      />
    </>
  );
}
