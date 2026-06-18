import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { env } from "@/lib/env";
import { PAGE_META } from "@/lib/content/meta";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: PAGE_META.home.title,
  description: PAGE_META.home.description,
  applicationName: "Natation Côte Basque",
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <body className="bg-paper text-ink min-h-screen antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: "0px",
              border: "1px solid #111111",
              background: "#ffffff",
              color: "#111111",
              fontFamily: "var(--font-montserrat)",
            },
          }}
        />
      </body>
    </html>
  );
}
