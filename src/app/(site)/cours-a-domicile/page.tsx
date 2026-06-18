import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow, InfoList } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import {
  CtaBlock,
  NumberedList,
  PageHero,
  SectionHeader,
} from "@/components/site/blocks";
import { DOMICILE } from "@/lib/content/domicile";
import { PHOTOS } from "@/lib/photos";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("domicile");

export default function CoursADomicilePage() {
  return (
    <>
      <PageHero
        eyebrow={DOMICILE.hero.eyebrow}
        titleLines={DOMICILE.hero.titleLines}
        text={DOMICILE.hero.text}
        cta={DOMICILE.hero.cta}
        photo={PHOTOS.domicile}
        imageClassName="aspect-[999/1218]"
      />

      <section className="shell py-16 md:py-24">
        <Reveal>
          <SectionHeader
            eyebrow={DOMICILE.steps.eyebrow}
            titleLines={DOMICILE.steps.titleLines}
          />
        </Reveal>
        <div className="mt-12">
          <NumberedList items={DOMICILE.steps.items} />
        </div>
      </section>

      <section className="bg-sand py-16 md:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeader
              titleLines={DOMICILE.accessible.titleLines}
              intro={DOMICILE.accessible.text}
            />
          </Reveal>
          <InfoList items={DOMICILE.accessible.infos} className="mt-12" />
          <div className="border-ink mt-10 border-l-2 pl-5">
            <Eyebrow>{DOMICILE.accessible.offerLabel}</Eyebrow>
            <p className="font-display text-ink mt-3 text-xl font-bold tracking-[-0.01em] md:text-2xl">
              {DOMICILE.accessible.offer}
            </p>
          </div>
          <PrimaryCta
            className="mt-10"
            label={DOMICILE.accessible.cta.label}
            href={DOMICILE.accessible.cta.href}
          />
        </div>
      </section>

      <CtaBlock
        titleLines={DOMICILE.finalCta.titleLines}
        text={DOMICILE.finalCta.text}
        buttons={DOMICILE.finalCta.buttons}
      />
    </>
  );
}
