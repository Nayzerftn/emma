import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow, InfoList } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import {
  CtaBlock,
  FeatureList,
  NumberedList,
  PageHero,
  SectionHeader,
  StepPath,
} from "@/components/site/blocks";
import { KINE } from "@/lib/content/kine";
import { PHOTOS } from "@/lib/photos";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("kine");

export default function KinesiologiePage() {
  return (
    <>
      <PageHero
        eyebrow={KINE.hero.eyebrow}
        titleLines={KINE.hero.titleLines}
        text={KINE.hero.text}
        cta={KINE.hero.cta}
        photo={PHOTOS.kinesiologie}
      />

      <section className="shell py-16 md:py-24">
        <Reveal>
          <Eyebrow>{KINE.volets.eyebrow}</Eyebrow>
        </Reveal>
        <div className="mt-6">
          <NumberedList items={KINE.volets.items} />
        </div>
        <PrimaryCta className="mt-10" label={KINE.volets.cta.label} href={KINE.volets.cta.href} />
      </section>

      <section className="shell py-16 md:py-24">
        <Reveal>
          <SectionHeader
            eyebrow={KINE.what.eyebrow}
            titleLines={KINE.what.titleLines}
            intro={KINE.what.text}
          />
        </Reveal>
        <div className="mt-12">
          <FeatureList items={KINE.what.cases} />
        </div>
      </section>

      <section className="bg-sand py-16 md:py-24">
        <div className="shell">
          <Reveal>
            <SectionHeader
              eyebrow={KINE.experts.eyebrow}
              titleLines={KINE.experts.titleLines}
            />
          </Reveal>
          <div className="mt-12">
            <FeatureList
              items={KINE.experts.items.map((e) => ({ title: e.name, text: e.text }))}
            />
          </div>
          <InfoList items={KINE.experts.infos} className="mt-12" />
          <PrimaryCta
            className="mt-10"
            label={KINE.experts.cta.label}
            href={KINE.experts.cta.href}
          />
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <Reveal>
          <Eyebrow>{KINE.parcours.eyebrow}</Eyebrow>
          <p className="text-meta mt-4 text-lg leading-relaxed">{KINE.parcours.intro}</p>
        </Reveal>
        <div className="mt-10">
          <StepPath steps={KINE.parcours.steps} />
        </div>
      </section>

      <CtaBlock
        titleLines={KINE.finalCta.titleLines}
        text={KINE.finalCta.text}
        buttons={KINE.finalCta.buttons}
        variant="ink"
      />
    </>
  );
}
