"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

/** Accordéon FAQ — sobre, hairlines, pas de fond coloré (DA). */
export function FaqAccordion({
  items,
  className,
}: {
  items: readonly { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <Accordion.Root type="single" collapsible className={cn("border-filet border-t", className)}>
      {items.map((it, i) => (
        <Accordion.Item key={i} value={`faq-${i}`} className="border-filet border-b">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-none">
              <span className="font-display text-ink text-lg font-bold tracking-[-0.01em] md:text-xl">
                {it.question}
              </span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="text-ink size-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-180"
              >
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            <p className="measure text-meta pb-6 leading-relaxed">{it.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
