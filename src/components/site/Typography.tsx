import { cn } from "@/lib/utils";

type TitleTag = "h1" | "h2" | "h3" | "p";

/** Titre display : chaque ligne (« / » du brief = retour à la ligne) sur sa propre ligne. */
export function DisplayTitle({
  lines,
  className,
  as: Tag = "h2",
}: {
  lines: readonly string[];
  className?: string;
  as?: TitleTag;
}) {
  return (
    <Tag className={cn("display", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </Tag>
  );
}

/** Eyebrow / méta : Montserrat 600 uppercase tracking large. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

/** Liste d'infos pratiques : lignes label / valeur séparées par des hairlines. */
export function InfoList({
  items,
  className,
}: {
  items: readonly { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("border-filet border-t", className)}>
      {items.map((it) => (
        <div
          key={it.label}
          className="border-filet flex flex-col gap-1 border-b py-4 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <dt className="eyebrow sm:w-44 sm:shrink-0">{it.label}</dt>
          <dd className="text-ink/90 leading-relaxed">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
