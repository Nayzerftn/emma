import type { Metadata } from "next";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";
import { PrimaryCta } from "@/components/site/CtaButtons";

export const metadata: Metadata = {
  title: "Réservation confirmée | Natation Côte Basque",
  robots: { index: false },
};

export default function ReservationSuccessPage() {
  return (
    <section className="shell flex min-h-[70vh] flex-col justify-center pt-32 pb-24">
      <Eyebrow>Réservation confirmée</Eyebrow>
      <DisplayTitle as="h1" lines={["Merci,", "c'est réservé."]} className="text-display mt-4" />
      <p className="measure text-meta mt-6 text-lg leading-relaxed">
        Votre paiement est bien confirmé et un email de confirmation vous a été envoyé.
        Juste un maillot et des lunettes — on s'occupe du reste. À très vite au bassin de
        Bidart.
      </p>
      <div className="mt-10">
        <PrimaryCta label="Retour à l'accueil" href="/" />
      </div>
    </section>
  );
}
