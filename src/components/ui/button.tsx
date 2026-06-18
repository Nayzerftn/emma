import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Bouton éditorial — radius 0, Montserrat 600 uppercase, hairlines nettes.
 * `asChild` permet de styler un <Link> ou un <a>.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display text-[0.74rem] font-semibold uppercase leading-none tracking-[0.12em] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-ink/85",
        outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
        inverse: "bg-paper text-ink hover:bg-paper/85",
        outlineInverse: "border border-paper/70 text-paper hover:bg-paper hover:text-ink",
        ghost: "text-ink hover:opacity-60",
      },
      size: {
        default: "px-7 py-4",
        sm: "px-5 py-3 text-[0.68rem]",
        lg: "px-9 py-5 text-[0.8rem]",
        none: "",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
