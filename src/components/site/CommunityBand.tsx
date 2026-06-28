import { Reveal } from "@/components/motion/Reveal";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/constants";

/** Invitation à la communauté WhatsApp (créneaux en avant-première). */
export function CommunityBand() {
  return (
    <section className="section-ink">
      <div className="shell py-20 md:py-28">
        <Reveal>
          <Eyebrow className="text-paper/70 mb-4">Communauté · WhatsApp</Eyebrow>
          <DisplayTitle
            lines={["Les nouveaux créneaux,", "en avant-première."]}
            className="text-h1 text-paper max-w-4xl"
          />
          <p className="text-paper/75 measure mt-6 text-lg leading-relaxed">
            Rejoignez la communauté Natation Côte Basque sur WhatsApp : l'ouverture des
            nouveaux créneaux annoncée en avant-première, avant tout le monde — et toutes nos
            actus.
          </p>
          <div className="mt-8">
            <PrimaryCta
              label="Rejoindre la communauté"
              href={WHATSAPP_COMMUNITY_URL}
              variant="inverse"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
