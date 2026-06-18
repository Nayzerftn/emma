"use client";

import { useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { OpenSlot } from "@/lib/slots";
import { createBookingCheckout } from "@/actions/bookings";
import { formatEuros } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/site/Typography";
import { WHATSAPP, waLink } from "@/lib/constants";

const LEVEL_LABELS: Record<number, string> = {
  1: "Grands débutants (niveau 1)",
  2: "En progression (niveau 2)",
  3: "Perfectionnement (niveau 3)",
};

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-5 py-3 text-left text-sm transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-filet text-ink hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

function slotLabel(s: OpenSlot) {
  return format(new Date(s.starts_at), "EEEE d MMMM · HH'h'mm", { locale: fr });
}

export function BookingTunnel({ slots }: { slots: OpenSlot[] }) {
  const [audience, setAudience] = useState<"enfant" | "adulte" | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levels = useMemo(
    () =>
      Array.from(
        new Set(
          slots
            .filter((s) => s.audience === "enfant" && s.level != null)
            .map((s) => s.level as number),
        ),
      ).sort(),
    [slots],
  );

  const filtered = useMemo(
    () =>
      slots
        .filter((s) => (audience ? s.audience === audience : false))
        .filter((s) => (audience === "enfant" && level ? s.level === level : true)),
    [slots, audience, level],
  );

  if (slots.length === 0) {
    return (
      <div className="border-filet border p-8">
        <p className="text-meta leading-relaxed">
          Aucun créneau en ligne pour le moment. Écrivez-nous, on vous trouve une place.
        </p>
        <a
          href={waLink(WHATSAPP.general)}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow underline-draw text-ink mt-4 inline-block"
        >
          WhatsApp — {WHATSAPP.general.phone}
        </a>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slotId) {
      setError("Choisissez un créneau.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await createBookingCheckout({
      slotId,
      customerName: fd.get("customerName"),
      customerEmail: fd.get("customerEmail"),
      customerPhone: fd.get("customerPhone"),
      participantName: fd.get("participantName"),
      participantAge: fd.get("participantAge") || undefined,
    });
    if (res.ok && res.url) {
      window.location.href = res.url;
    } else {
      setError(res.message ?? "Une erreur est survenue.");
      setSubmitting(false);
    }
  }

  return (
    <div className="border-filet border p-6 md:p-8">
      <div className="space-y-8">
        <div>
          <Eyebrow className="mb-3">1 · Pour qui ?</Eyebrow>
          <div className="flex flex-wrap gap-3">
            <Choice
              active={audience === "enfant"}
              onClick={() => {
                setAudience("enfant");
                setSlotId(null);
              }}
            >
              Enfant — mini-groupe
            </Choice>
            <Choice
              active={audience === "adulte"}
              onClick={() => {
                setAudience("adulte");
                setLevel(null);
                setSlotId(null);
              }}
            >
              Adulte — séance individuelle
            </Choice>
          </div>
        </div>

        {audience === "enfant" && levels.length > 0 && (
          <div>
            <Eyebrow className="mb-3">2 · Niveau</Eyebrow>
            <div className="flex flex-wrap gap-3">
              {levels.map((lv) => (
                <Choice
                  key={lv}
                  active={level === lv}
                  onClick={() => {
                    setLevel(lv);
                    setSlotId(null);
                  }}
                >
                  {LEVEL_LABELS[lv] ?? `Niveau ${lv}`}
                </Choice>
              ))}
            </div>
          </div>
        )}

        {audience && (
          <div>
            <Eyebrow className="mb-3">{audience === "enfant" ? "3" : "2"} · Créneau</Eyebrow>
            {filtered.length === 0 ? (
              <p className="text-meta text-sm">
                Aucun créneau disponible pour ce choix. Essayez une autre option ou
                écrivez-nous sur WhatsApp.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {filtered.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSlotId(s.id)}
                      className={cn(
                        "w-full border p-4 text-left transition-colors",
                        slotId === s.id
                          ? "border-ink bg-sand"
                          : "border-filet hover:border-ink",
                      )}
                    >
                      <span className="font-display block font-bold capitalize">
                        {slotLabel(s)}
                      </span>
                      <span className="text-meta mt-1 block text-sm">
                        {s.teacher ? `Avec ${s.teacher} · ` : ""}
                        {formatEuros(s.price_cents)} · {s.remaining} place
                        {s.remaining > 1 ? "s" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {slotId && (
          <form onSubmit={onSubmit} className="border-filet grid gap-5 border-t pt-8 sm:grid-cols-2">
            <Field label="Votre nom" htmlFor="customerName" required className="sm:col-span-2">
              <Input id="customerName" name="customerName" autoComplete="name" required />
            </Field>
            <Field label="Email" htmlFor="customerEmail" required>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Téléphone" htmlFor="customerPhone" required>
              <Input id="customerPhone" name="customerPhone" type="tel" required />
            </Field>
            <Field label="Nom du participant" htmlFor="participantName" required>
              <Input id="participantName" name="participantName" required />
            </Field>
            <Field label="Âge (si enfant)" htmlFor="participantAge">
              <Input id="participantAge" name="participantAge" type="number" min={2} max={99} />
            </Field>
            {error && (
              <p className="text-ink/70 sm:col-span-2" role="alert">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "Redirection…" : "Payer et réserver"}
              </Button>
            </div>
          </form>
        )}

        {error && !slotId && (
          <p className="text-ink/70" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
