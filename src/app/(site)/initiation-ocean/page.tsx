import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { InfoList } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import {
  CtaBlock,
  FeatureList,
  PageHero,
  SectionHeader,
} from "@/components/site/blocks";
import { OCEAN } from "@/lib/content/ocean";
import { PHOTOS } from "@/lib/photos";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("ocean");

export default function InitiationOceanPage() {
  return (
    <>
      <PageHero
        eyebrow={OCEAN.hero.eyebrow}
        titleLines={OCEAN.hero.titleLines}
        text={OCEAN.hero.text}
        cta={OCEAN.hero.cta}
        photo={PHOTOS.ocean}
      />

      <section className="shell py-16 md:py-24">
        <Reveal>
          <SectionHeader titleLines={OCEAN.learn.titleLines} intro={OCEAN.learn.text} />
        </Reveal>
        <div className="mt-12">
          <FeatureList items={OCEAN.learn.items} />
        </div>
        <InfoList items={OCEAN.learn.infos} className="mt-12" />
        <PrimaryCta className="mt-10" label={OCEAN.learn.cta.label} href={OCEAN.learn.cta.href} />
      </section>

      <section className="bg-sand py-16 md:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeader
              eyebrow={OCEAN.longeCote.eyebrow}
              titleLines={OCEAN.longeCote.titleLines}
              intro={OCEAN.longeCote.text}
            />
          </Reveal>
          <InfoList items={OCEAN.longeCote.infos} className="mt-12" />
          <PrimaryCta
            className="mt-10"
            label={OCEAN.longeCote.cta.label}
            href={OCEAN.longeCote.cta.href}
          />
        </div>
      </section>

      <CtaBlock
        titleLines={OCEAN.finalCta.titleLines}
        text={OCEAN.finalCta.text}
        buttons={OCEAN.finalCta.buttons}
      />
    </>
  );
}
