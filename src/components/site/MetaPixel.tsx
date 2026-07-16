"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = "989853170590617";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Pixel Meta (Facebook) :
 *  - PageView au chargement + à chaque navigation client (App Router).
 *  - Événement « Lead » quand un visiteur clique pour réserver (Square) ou
 *    contacter une prof (WhatsApp kiné/surf). Le paiement se faisant sur Square
 *    (hors site), l'achat lui-même se track via Square → Meta (Make / API conversions).
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  // PageView sur navigation client (le 1er est déjà envoyé par le script).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  // « Lead » au clic sur un lien de réservation Square ou WhatsApp (kiné/surf).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.("a");
      const href = link?.getAttribute("href") ?? "";
      if (/squareup\.com|wa\.me/.test(href)) window.fbq?.("track", "Lead");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
