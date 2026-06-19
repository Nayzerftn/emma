import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SITE, POOL_ADDRESS, CITIES } from "@/lib/constants";
import { PAGE_META, type PageKey } from "@/lib/content/meta";

/** Construit l'objet Metadata exact d'une page (title/description Annexe A). */
export function pageMetadata(key: PageKey): Metadata {
  const m = PAGE_META[key];
  const url = new URL(m.path, env.siteUrl).toString();
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.path },
    openGraph: {
      title: m.title,
      description: m.description,
      url,
      siteName: SITE.name,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
    },
  };
}

/** JSON-LD LocalBusiness / SportsActivityLocation. */
export function sportsActivityLocationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${env.siteUrl}#business`,
    name: SITE.name,
    description: PAGE_META.home.description,
    url: env.siteUrl,
    sameAs: [SITE.instagram],
    address: {
      "@type": "PostalAddress",
      addressLocality: POOL_ADDRESS.city,
      addressRegion: "Pyrénées-Atlantiques",
      addressCountry: "FR",
    },
    areaServed: CITIES.map((city) => ({ "@type": "City", name: city })),
    knowsLanguage: ["fr", "en"],
    sport: "Swimming",
  };
}

/** JSON-LD FAQPage. */
export function faqPageLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}
