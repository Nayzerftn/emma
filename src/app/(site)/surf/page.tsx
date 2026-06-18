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
import { SURF } from "@/lib/content/surf";
import { PHOTOS } from "@/lib/photos";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("surf");

export default function SurfPage() {
  return (
    <>
      <PageHero
        eyebrow={SURF.hero.eyebrow}
        titleLines={SURF.hero.titleLines}
        text={SURF.hero.text}
        cta={SURF.hero.cta}
        photo={PHOTOS.surf}
      />

      <section className="shell py-16 md:py-24">
        <Reveal>
          <SectionHeader
            eyebrow={SURF.formules.eyebrow}
            titleLines={SURF.formules.titleLines}
          />
        </Reveal>
        <div className="mt-12">
          <FeatureList items={SURF.formules.items} />
        </div>
        <InfoList items={SURF.formules.infos} className="mt-12" />
        <PrimaryCta
          className="mt-10"
          label={SURF.formules.cta.label}
          href={SURF.formules.cta.href}
        />
      </section>

      <CtaBlock
        titleLines={SURF.finalCta.titleLines}
        text={SURF.finalCta.text}
        buttons={SURF.finalCta.buttons}
      />
    </>
  );
}
