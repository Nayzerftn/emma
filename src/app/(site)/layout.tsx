import { Masthead } from "@/components/site/Masthead";
import { Footer } from "@/components/site/Footer";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LenisProvider />
      <ScrollProgress />
      <Masthead />
      <main id="top">{children}</main>
      <Footer />
    </>
  );
}
