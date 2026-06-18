import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";
import type { CtaButton } from "@/lib/content/types";

function variantFor(kind: CtaButton["kind"]) {
  return kind === "primary" ? "primary" : "outline";
}

/** Rangée de boutons CTA (Link interne / lien externe wa.me), magnétiques desktop. */
export function CtaButtons({
  buttons,
  className,
  variantOverride,
}: {
  buttons: readonly CtaButton[];
  className?: string;
  /** Pour les sections fond ink (boutons clairs). */
  variantOverride?: "inverse-set";
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}>
      {buttons.map((b) => {
        const external = b.href.startsWith("http");
        let variant: "primary" | "outline" | "inverse" | "outlineInverse" = variantFor(
          b.kind,
        );
        if (variantOverride === "inverse-set") {
          variant = b.kind === "primary" ? "inverse" : "outlineInverse";
        }
        const content = external ? (
          <a href={b.href} target="_blank" rel="noopener noreferrer">
            {b.label}
          </a>
        ) : (
          <Link href={b.href}>{b.label}</Link>
        );
        return (
          <Magnetic key={b.label}>
            <Button asChild variant={variant} className="w-full sm:w-auto">
              {content}
            </Button>
          </Magnetic>
        );
      })}
    </div>
  );
}

/** Bouton CTA unique (hero) — toujours primaire, magnétique. */
export function PrimaryCta({
  label,
  href,
  className,
  variant = "primary",
}: {
  label: string;
  href: string;
  className?: string;
  variant?: "primary" | "inverse";
}) {
  const external = href.startsWith("http");
  return (
    <Magnetic className={className}>
      <Button asChild variant={variant} size="lg">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          <Link href={href}>{label}</Link>
        )}
      </Button>
    </Magnetic>
  );
}
