import type { Metadata } from "next";
import { HeroVideo } from "@/components/site/HeroVideo";
import { Reveal } from "@/components/motion/Reveal";
import { WaterLine } from "@/components/motion/WaterLine";
import { DisplayTitle } from "@/components/site/Typography";
import {
  CtaBlock,
  FaqSection,
  IllustratedQuote,
  MarqueeSection,
  OfferRow,
  StatsBand,
  Testimonials,
  TrustBand,
} from "@/components/site/blocks";
import { CommunityBand } from "@/components/site/CommunityBand";
import { HOME } from "@/lib/content/home";
import { getFaq, getTestimonials } from "@/lib/content/resolvers";
import { pageMetadata, sportsActivityLocationLd, faqPageLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("home");
export const revalidate = 3600;

export default async function HomePage() {
  const [testimonials, faq] = await Promise.all([getTestimonials(), getFaq("home")]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsActivityLocationLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(faq)) }}
      />

      <HeroVideo
        eyebrow={HOME.hero.eyebrow}
        titleLines={HOME.hero.titleLines}
        subtitle={HOME.hero.subtitle}
        ctaLabel={HOME.hero.cta.label}
        ctaHref={HOME.hero.cta.href}
      />

      <StatsBand items={HOME.stats} />

      <section className="shell py-20 md:py-28">
        <Reveal>
          <DisplayTitle lines={HOME.manifesto.titleLines} className="text-display max-w-4xl" />
          <p className="measure text-meta mt-8 text-lg leading-relaxed">
            {HOME.manifesto.text}
          </p>
        </Reveal>
      </section>

      <section id="offres" className="shell scroll-mt-24 py-12 md:py-16">
        <div className="space-y-16 md:space-y-24">
          {HOME.offers.map((offer, i) => (
            <div key={offer.href + i}>
              <OfferRow offer={offer} index={i} />
              {i < HOME.offers.length - 1 && (
                <WaterLine className="mt-16 md:mt-24" />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-px md:mt-12">
        {HOME.illustrated.map((section, i) => (
          <IllustratedQuote key={i} section={section} />
        ))}
      </div>

      <TrustBand items={HOME.trust} />

      <MarqueeSection
        titleLines={HOME.bab.titleLines}
        text={HOME.bab.text}
        cities={HOME.bab.cities}
      />

      <Testimonials items={testimonials} />

      <CommunityBand />

      <FaqSection items={faq} titleLines={["Vos questions,", "nos réponses."]} />

      <CtaBlock
        titleLines={HOME.finalCta.titleLines}
        text={HOME.finalCta.text}
        buttons={HOME.finalCta.buttons}
      />
    </>
  );
}
