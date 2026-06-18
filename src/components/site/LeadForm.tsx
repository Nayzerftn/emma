"use client";

import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/validation/lead";
import { submitLead } from "@/actions/leads";
import { Field } from "@/components/ui/field";
import { Input, Textarea, NativeSelect } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LeadForm({
  initialType = "domicile",
}: {
  initialType?: "domicile" | "ocean";
}) {
  const [done, setDone] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      type: initialType,
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      level: "",
      availability: "",
      groupSize: "",
      message: "",
    },
  });

  async function onSubmit(values: LeadInput, event?: BaseSyntheticEvent) {
    setServerError(null);
    const form = event?.target as HTMLFormElement | undefined;
    const website = form ? String(new FormData(form).get("website") ?? "") : "";
    const res = await submitLead({ ...values, website });
    if (res.ok) {
      setDone(res.message);
      reset();
    } else {
      setServerError(res.message);
    }
  }

  if (done) {
    return (
      <div className="border-ink border p-8">
        <p className="eyebrow">Demande envoyée</p>
        <p className="mt-3 text-lg leading-relaxed">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Field label="Type de cours" htmlFor="type">
        <NativeSelect id="type" {...register("type")}>
          <option value="domicile">Cours à domicile</option>
          <option value="ocean">Initiation océan</option>
        </NativeSelect>
      </Field>

      <Field label="Nom" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...register("name")} />
      </Field>
      <Field label="Email" htmlFor="email" required error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Téléphone" htmlFor="phone" required error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="Ville" htmlFor="city" required error={errors.city?.message}>
        <Input id="city" {...register("city")} />
      </Field>
      <Field label="Adresse" htmlFor="address">
        <Input id="address" autoComplete="street-address" {...register("address")} />
      </Field>
      <Field label="Niveau" htmlFor="level">
        <Input id="level" placeholder="Débutant, perfectionnement…" {...register("level")} />
      </Field>
      <Field label="Taille du groupe" htmlFor="groupSize">
        <Input id="groupSize" placeholder="1 enfant, 3 enfants…" {...register("groupSize")} />
      </Field>
      <Field label="Disponibilités" htmlFor="availability" className="sm:col-span-2">
        <Input
          id="availability"
          placeholder="Week-ends, mercredis après-midi…"
          {...register("availability")}
        />
      </Field>
      <Field label="Message" htmlFor="message" className="sm:col-span-2">
        <Textarea id="message" {...register("message")} />
      </Field>

      {serverError && (
        <p className="text-ink/70 sm:col-span-2" role="alert">
          {serverError}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Envoi…" : "Envoyer ma demande"}
        </Button>
      </div>
    </form>
  );
}
