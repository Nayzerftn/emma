import { cn } from "@/lib/utils";

/** Champ de formulaire : label (eyebrow) + contenu + message d'erreur. */
export function Field({
  label,
  htmlFor,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="eyebrow text-ink">
        {label}
        {required && <span className="text-meta"> *</span>}
      </label>
      {children}
      {error && (
        <span className="text-[0.78rem] text-ink/70" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
