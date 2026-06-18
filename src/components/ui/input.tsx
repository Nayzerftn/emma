import { cn } from "@/lib/utils";

const base =
  "w-full border border-filet bg-paper px-4 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-meta/60 focus:border-ink disabled:opacity-50";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("h-12", base, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-28 py-3 leading-relaxed", base, className)} {...props} />;
}

export function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select className={cn("h-12 appearance-none", base, className)} {...props}>
      {children}
    </select>
  );
}
