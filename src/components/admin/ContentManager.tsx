"use client";

import { useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  saveContentBlock,
  saveTestimonial,
  deleteTestimonial,
  saveFaq,
  deleteFaq,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea, NativeSelect } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/AdminShell";
import type { ActionResult } from "@/actions/admin";

type Block = { id: string; page: string; key: string; value: string };
type Testi = { id: string; author: string; quote: string; display_order: number; published: boolean };
type Faq = {
  id: string;
  page: string;
  question: string;
  answer: string;
  display_order: number;
  published: boolean;
};

export function ContentManager({
  blocks,
  testimonials,
  faq,
}: {
  blocks: Block[];
  testimonials: Testi[];
  faq: Faq[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(p: Promise<ActionResult>, reset?: () => void) {
    start(async () => {
      const res = await p;
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) {
        reset?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-16">
      {/* Blocs de texte */}
      <section>
        <h2 className="eyebrow mb-4">Textes des pages</h2>
        {blocks.length === 0 ? (
          <EmptyState>Aucun bloc — le seed initialise des textes éditables.</EmptyState>
        ) : (
          <div className="space-y-6">
            {blocks.map((b) => (
              <form
                key={b.id}
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const value = String(new FormData(e.currentTarget).get("value"));
                  run(saveContentBlock(b.page, b.key, value));
                }}
                className="border-filet border p-4"
              >
                <p className="eyebrow text-meta mb-2">
                  {b.page} · {b.key}
                </p>
                <Textarea name="value" defaultValue={b.value} className="min-h-24" />
                <Button type="submit" size="sm" variant="outline" className="mt-3" disabled={pending}>
                  Enregistrer
                </Button>
              </form>
            ))}
          </div>
        )}
      </section>

      {/* Témoignages */}
      <section>
        <h2 className="eyebrow mb-4">Témoignages</h2>
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="border-filet flex items-start justify-between gap-4 border p-4">
              <div>
                <p className="italic">«&nbsp;{t.quote}&nbsp;»</p>
                <p className="text-meta mt-1 text-sm">
                  {t.author} · ordre {t.display_order} · {t.published ? "publié" : "masqué"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => run(deleteTestimonial(t.id))}
              >
                Suppr.
              </Button>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const form = e.currentTarget;
            run(
              saveTestimonial({
                author: String(fd.get("author")),
                quote: String(fd.get("quote")),
                order: Number(fd.get("order")) || 0,
                published: fd.get("published") === "on",
              }),
              () => form.reset(),
            );
          }}
          className="border-filet mt-6 grid gap-4 border border-dashed p-4"
        >
          <p className="eyebrow">Ajouter un témoignage</p>
          <Field label="Auteur" htmlFor="t-author" required>
            <Input id="t-author" name="author" required />
          </Field>
          <Field label="Citation" htmlFor="t-quote" required>
            <Textarea id="t-quote" name="quote" required />
          </Field>
          <div className="grid grid-cols-2 items-end gap-4">
            <Field label="Ordre" htmlFor="t-order">
              <Input id="t-order" name="order" type="number" defaultValue={0} />
            </Field>
            <label className="flex items-center gap-2 pb-3 text-sm">
              <input type="checkbox" name="published" defaultChecked className="size-4" /> Publié
            </label>
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            Ajouter
          </Button>
        </form>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="eyebrow mb-4">FAQ</h2>
        <div className="space-y-3">
          {faq.map((f) => (
            <div key={f.id} className="border-filet flex items-start justify-between gap-4 border p-4">
              <div>
                <p className="font-display font-bold">{f.question}</p>
                <p className="text-meta mt-1 text-sm">{f.answer}</p>
                <p className="text-meta mt-1 text-xs">
                  {f.page} · ordre {f.display_order} · {f.published ? "publié" : "masqué"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => run(deleteFaq(f.id))}
              >
                Suppr.
              </Button>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const form = e.currentTarget;
            run(
              saveFaq({
                page: String(fd.get("page")),
                question: String(fd.get("question")),
                answer: String(fd.get("answer")),
                order: Number(fd.get("order")) || 0,
                published: fd.get("published") === "on",
              }),
              () => form.reset(),
            );
          }}
          className="border-filet mt-6 grid gap-4 border border-dashed p-4"
        >
          <p className="eyebrow">Ajouter une question</p>
          <Field label="Page" htmlFor="f-page">
            <NativeSelect id="f-page" name="page" defaultValue="home">
              <option value="home">Accueil</option>
              <option value="reservation">Réservation</option>
            </NativeSelect>
          </Field>
          <Field label="Question" htmlFor="f-question" required>
            <Input id="f-question" name="question" required />
          </Field>
          <Field label="Réponse" htmlFor="f-answer" required>
            <Textarea id="f-answer" name="answer" required />
          </Field>
          <div className="grid grid-cols-2 items-end gap-4">
            <Field label="Ordre" htmlFor="f-order">
              <Input id="f-order" name="order" type="number" defaultValue={0} />
            </Field>
            <label className="flex items-center gap-2 pb-3 text-sm">
              <input type="checkbox" name="published" defaultChecked className="size-4" /> Publié
            </label>
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            Ajouter
          </Button>
        </form>
      </section>
    </div>
  );
}
