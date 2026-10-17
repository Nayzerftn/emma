import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow, InfoList } from "@/components/site/Typography";
import { EditorialImage } from "@/components/site/EditorialImage";
import { CtaButtons } from "@/components/site/CtaButtons";
import { CtaBlock, FeatureList, NumberedList, SectionHeader } from "@/components/site/blocks";
import { BASSIN } from "@/lib/content/bassin";
import { PHOTOS } from "@/lib/photos";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("bassin");

export default function BassinPrivePage() {
  return (
    <>
      <section className="shell grid items-center gap-10 pt-28 pb-12 md:grid-cols-2 md:gap-16 md:pt-36 md:pb-20">
        <Reveal>
          <Eyebrow className="mb-4">{BASSIN.hero.eyebrow}</Eyebrow>
          <DisplayTitle as="h1" lines={BASSIN.hero.titleLines} className="text-h1" />
          <p className="measure text-meta mt-6 text-lg leading-relaxed">
            {BASSIN.hero.text}
          </p>
          <CtaButtons className="mt-8" buttons={BASSIN.hero.buttons} />
        </Reveal>
        <Reveal delay={0.1}>
          <EditorialImage
            slot={PHOTOS.bassin}
            className="mx-auto aspect-[919/1387] max-w-sm"
            sizes="(min-width:768px) 24rem, 100vw"
          />
        </Reveal>
      </section>

      <section className="shell py-16 md:py-24">
        <Reveal>
          <SectionHeader
            eyebrow={BASSIN.enfants.eyebrow}
            titleLines={BASSIN.enfants.titleLines}
            intro={BASSIN.enfants.intro}
          />
        </Reveal>
        <div className="mt-12">
          <NumberedList items={BASSIN.enfants.levels} />
        </div>
      </section>

      <section className="bg-sand py-16 md:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeader
              eyebrow={BASSIN.adultes.eyebrow}
              titleLines={BASSIN.adultes.titleLines}
              intro={BASSIN.adultes.text}
            />
          </Reveal>
          <div className="mt-12">
            <FeatureList items={BASSIN.adultes.formats} />
          </div>
          <InfoList items={BASSIN.infos} className="mt-12" />
          <CtaButtons className="mt-10" buttons={BASSIN.ctaMid} />
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <Reveal>
          <SectionHeader eyebrow={BASSIN.apnee.eyebrow} titleLines={BASSIN.apnee.titleLines} />
        </Reveal>
        <div className="mt-12">
          <FeatureList items={BASSIN.apnee.items} />
        </div>
      </section>

      <CtaBlock
        titleLines={BASSIN.finalCta.titleLines}
        text={BASSIN.finalCta.text}
        buttons={BASSIN.finalCta.buttons}
      />
    </>
  );
}
