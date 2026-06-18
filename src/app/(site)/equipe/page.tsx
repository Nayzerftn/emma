import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { CtaBlock, InkStatement } from "@/components/site/blocks";
import { Roster } from "@/components/site/Roster";
import { EQUIPE } from "@/lib/content/equipe";
import { getTeam } from "@/lib/content/resolvers";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("equipe");
export const revalidate = 3600;

export default async function EquipePage() {
  const team = await getTeam();

  return (
    <>
      <section className="shell pt-28 pb-12 md:pt-40 md:pb-16">
        <Reveal>
          <Eyebrow className="mb-4">{EQUIPE.hero.eyebrow}</Eyebrow>
          <DisplayTitle as="h1" lines={EQUIPE.hero.titleLines} className="text-display" />
          <p className="measure text-meta mt-6 text-lg leading-relaxed">
            {EQUIPE.hero.text}
          </p>
        </Reveal>
      </section>

      <section className="shell pb-20 md:pb-28">
        <Roster members={team} />
      </section>

      <InkStatement titleLines={EQUIPE.sectionTitleLines} />

      <CtaBlock
        titleLines={EQUIPE.finalCta.titleLines}
        text={EQUIPE.finalCta.text}
        buttons={EQUIPE.finalCta.buttons}
      />
    </>
  );
}
