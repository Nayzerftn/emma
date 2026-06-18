import type { Metadata } from "next";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";

export const metadata: Metadata = {
  title: "Réservation annulée | Natation Côte Basque",
  robots: { index: false },
};

export default function ReservationCancelPage() {
  return (
    <section className="shell flex min-h-[70vh] flex-col justify-center pt-32 pb-24">
      <Eyebrow>Paiement annulé</Eyebrow>
      <DisplayTitle as="h1" lines={["Pas de souci,", "rien n'est perdu."]} className="text-display mt-4" />
      <p className="measure text-meta mt-6 text-lg leading-relaxed">
        Votre paiement a été annulé et aucun montant n'a été débité. Vous pouvez
        reprendre votre réservation quand vous voulez.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <PrimaryCta label="Reprendre ma réservation" href="/reservation#bassin" />
      </div>
    </section>
  );
}
