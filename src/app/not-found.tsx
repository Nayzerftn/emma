import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DisplayTitle, Eyebrow } from "@/components/site/Typography";

export default function NotFound() {
  return (
    <main className="shell flex min-h-screen flex-col justify-center py-20">
      <Eyebrow>Erreur 404</Eyebrow>
      <DisplayTitle as="h1" lines={["Cette page", "a pris l'eau."]} className="text-display mt-4" />
      <p className="measure text-meta mt-6 text-lg leading-relaxed">
        La page que vous cherchez n'existe pas ou a été déplacée. Revenez à l'accueil pour
        retrouver nos cours de natation sur la Côte Basque.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </main>
  );
}
