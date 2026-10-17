import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { EditorialImage } from "@/components/site/EditorialImage";
import { CtaButtons, PrimaryCta } from "@/components/site/CtaButtons";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { FaqAccordion } from "@/components/ui/accordion";
import { PHOTOS, type PhotoSlot } from "@/lib/photos";
import type { CtaButton, IllustratedSection, Offer } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/* ── En-tête de section ────────────────────────────────────────── */
export function SectionHeader({
  eyebrow,
  titleLines,
  intro,
  className,
}: {
  eyebrow?: string;
  titleLines: readonly string[];
  intro?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <DisplayTitle lines={titleLines} className="text-h1" />
      {intro && (
        <p className="measure text-meta mt-6 text-lg leading-relaxed">{intro}</p>
      )}
    </div>
  );
}

/* ── Hero des pages intérieures ────────────────────────────────── */
export function PageHero({
  eyebrow,
  titleLines,
  text,
  cta,
  photo,
  imageClassName = "aspect-[4/3]",
}: {
  eyebrow: string;
  titleLines: readonly string[];
  text: string;
  cta?: { label: string; href: string };
  photo?: PhotoSlot;
  /** Ratio/contrainte de la photo (par défaut paysage 4/3). */
  imageClassName?: string;
}) {
  return (
    <section className="shell grid items-start gap-10 pt-24 pb-14 md:grid-cols-2 md:items-center md:gap-20 md:pt-32 md:pb-20">
      <Reveal>
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <DisplayTitle as="h1" lines={titleLines} className="text-h1" />
        <p className="measure text-meta mt-6 text-lg leading-relaxed">{text}</p>
        {cta && <PrimaryCta className="mt-8" label={cta.label} href={cta.href} />}
      </Reveal>
      {photo && (
        <Reveal delay={0.1}>
          <EditorialImage
            slot={photo}
            className={imageClassName}
            hoverZoom
            sizes="(min-width:768px) 45vw, 100vw"
          />
        </Reveal>
      )}
    </section>
  );
}

/* ── Bandeau stats (fond ink) ──────────────────────────────────── */
export function StatsBand({ items }: { items: readonly { head: string; sub: string }[] }) {
  return (
    <section className="section-ink">
      <div className="shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <Reveal
            key={i}
            delay={i * 0.08}
            className="border-paper/15 flex flex-col gap-2 border-b py-8 sm:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0"
          >
            <p className="font-display text-lg font-black uppercase tracking-[-0.02em] whitespace-nowrap">
              {s.head}
            </p>
            <p className="text-paper/65 text-small">{s.sub}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Ligne offre éditoriale (alternée) ─────────────────────────── */
export function OfferRow({ offer, index }: { offer: Offer; index: number }) {
  const flip = index % 2 === 1;
  return (
    <Reveal>
      <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <Link
          href={offer.href}
          aria-label={offer.titleLines.join(" ")}
          className={cn("block", flip && "md:order-2")}
        >
          <EditorialImage
            slot={PHOTOS[offer.photo]}
            className="aspect-[4/3]"
            hoverZoom
            sizes="(min-width:768px) 50vw, 100vw"
          />
        </Link>
        <div className={cn(flip && "md:order-1")}>
          <Eyebrow className="mb-3">{offer.eyebrow}</Eyebrow>
          <DisplayTitle lines={offer.titleLines} className="text-h2" />
          <p className="measure text-meta mt-5 leading-relaxed">{offer.text}</p>
          {offer.detail && (
            <p className="measure text-ink mt-4 font-semibold leading-relaxed">
              {offer.detail}
            </p>
          )}
          <Link
            href={offer.href}
            className="eyebrow underline-draw text-ink mt-6 inline-block"
          >
            Découvrir
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

/* ── Citation plein cadre sur photo ────────────────────────────── */
export function IllustratedQuote({ section }: { section: IllustratedSection }) {
  return (
    <section className="relative">
      <EditorialImage
        slot={PHOTOS[section.photo]}
        className="h-[72vh] min-h-[420px]"
        scrim
        sizes="100vw"
      />
      <div className="shell pointer-events-none absolute inset-0 z-20 flex flex-col justify-end pb-12 md:pb-16">
        <Reveal>
          <DisplayTitle lines={section.quoteLines} className="text-display text-paper" />
          <p className="eyebrow text-paper/85 mt-4">{section.meta}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Bloc fond ink (collectif) ─────────────────────────────────── */
export function InkStatement({
  titleLines,
  text,
}: {
  titleLines: readonly string[];
  text?: string;
}) {
  return (
    <section className="section-ink">
      <div className="shell py-20 md:py-28">
        <Reveal>
          <DisplayTitle lines={titleLines} className="text-h1 text-paper max-w-4xl" />
          {text && (
            <p className="text-paper/75 measure mt-8 text-lg leading-relaxed">{text}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ── Bandeau confiance (4 marques) ─────────────────────────────── */
function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function TrustBand({ items }: { items: readonly string[] }) {
  return (
    <section className="shell py-16 md:py-20">
      <ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">
        {items.map((t, i) => (
          <li key={i} className="border-filet border-t pt-6">
            <Reveal delay={i * 0.06} className="flex items-start gap-4">
              <span className="text-ink mt-0.5">
                <CheckMark />
              </span>
              <span className="text-ink/90 leading-relaxed">{t}</span>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Zone BAB + marquee villes ─────────────────────────────────── */
export function MarqueeSection({
  titleLines,
  text,
  cities,
}: {
  titleLines: readonly string[];
  text: string;
  cities: readonly string[];
}) {
  return (
    <section className="bg-sand py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <DisplayTitle lines={titleLines} className="text-h1 max-w-3xl" />
          <p className="measure text-meta mt-6 text-lg leading-relaxed">{text}</p>
        </Reveal>
      </div>
      <div className="border-filet mt-12 border-y py-6 md:mt-16">
        <Marquee items={cities} />
      </div>
    </section>
  );
}

/* ── Témoignages ───────────────────────────────────────────────── */
export function Testimonials({
  items,
}: {
  items: readonly { quote: string; author: string }[];
}) {
  return (
    <section className="shell py-20 md:py-28">
      <Reveal>
        <Eyebrow>Témoignages</Eyebrow>
      </Reveal>
      <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-10">
        {items.map((t, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <figure className="flex h-full flex-col">
              <blockquote className="font-display text-xl leading-snug font-medium tracking-[-0.01em] md:text-[1.6rem]">
                «&nbsp;{t.quote}&nbsp;»
              </blockquote>
              <figcaption className="eyebrow text-meta mt-6">{t.author}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Séquence 01/02/03 ─────────────────────────────────────────── */
export function NumberedList({
  items,
}: {
  items: readonly { n: string; title: string; text: string }[];
}) {
  return (
    <ol className="border-filet border-t">
      {items.map((it, i) => (
        <li key={it.n} className="border-filet border-b py-8">
          <Reveal delay={i * 0.05} className="grid gap-4 md:grid-cols-[auto_1fr] md:gap-12">
            <span className="seq-number text-meta/40 text-5xl md:text-6xl">{it.n}</span>
            <div>
              <h3 className="font-display text-lg font-bold tracking-[-0.01em] md:text-xl">
                {it.title}
              </h3>
              <p className="measure text-meta mt-3 leading-relaxed">{it.text}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

/* ── Liste de features (titre + texte, sans numéro) ────────────── */
export function FeatureList({
  items,
}: {
  items: readonly { title: string; text: string }[];
}) {
  return (
    <ul className="border-filet border-t">
      {items.map((it, i) => (
        <li key={i} className="border-filet border-b py-6">
          <Reveal delay={i * 0.05}>
            <h3 className="font-display text-lg font-bold tracking-[-0.01em] md:text-xl">
              {it.title}
            </h3>
            <p className="measure text-meta mt-2 leading-relaxed">{it.text}</p>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/* ── Parcours en étapes reliées par des flèches ───────────────── */
function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6 shrink-0", className)}>
      <path d="M4 12h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function StepPath({
  steps,
}: {
  steps: readonly { title: string; text?: string }[];
}) {
  return (
    <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      {steps.map((step, i) => (
        <li key={step.title} className="flex flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center">
          <Reveal delay={i * 0.06} className="border-ink/80 flex-1 self-stretch border p-5">
            <span className="seq-number text-meta/50 text-2xl">0{i + 1}</span>
            <h3 className="font-display mt-2 text-lg font-bold tracking-[-0.01em]">
              {step.title}
            </h3>
            {step.text && <p className="text-meta mt-2 leading-relaxed">{step.text}</p>}
          </Reveal>
          {i < steps.length - 1 && (
            <Arrow className="text-ink mx-auto rotate-90 lg:mx-0 lg:rotate-0" />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────── */
export function FaqSection({
  items,
  eyebrow = "Questions fréquentes",
  titleLines,
}: {
  items: readonly { question: string; answer: string }[];
  eyebrow?: string;
  titleLines?: readonly string[];
}) {
  return (
    <section className="shell py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          {titleLines && <DisplayTitle lines={titleLines} className="text-h2 mt-3" />}
        </Reveal>
        <Reveal delay={0.1}>
          <FaqAccordion items={items} />
        </Reveal>
      </div>
    </section>
  );
}

/* ── Bloc CTA final (paper ou ink) ─────────────────────────────── */
export function CtaBlock({
  titleLines,
  text,
  buttons,
  variant = "paper",
}: {
  titleLines: readonly string[];
  text: string;
  buttons: readonly CtaButton[];
  variant?: "paper" | "ink";
}) {
  const ink = variant === "ink";
  return (
    <section className={ink ? "section-ink" : "bg-paper"}>
      <div className="shell py-20 md:py-28">
        <Reveal>
          <DisplayTitle
            lines={titleLines}
            className={cn("text-display max-w-4xl", ink && "text-paper")}
          />
          <p
            className={cn(
              "measure mt-8 text-lg leading-relaxed",
              ink ? "text-paper/75" : "text-meta",
            )}
          >
            {text}
          </p>
          <CtaButtons
            buttons={buttons}
            className="mt-10"
            variantOverride={ink ? "inverse-set" : undefined}
          />
        </Reveal>
      </div>
    </section>
  );
}
