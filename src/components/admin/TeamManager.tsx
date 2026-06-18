"use client";

import { useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveTeamMember, deleteTeamMember, type ActionResult } from "@/actions/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import type { Service } from "@/lib/supabase/types";

const SERVICES: { key: Service; label: string }[] = [
  { key: "bassin", label: "Bassin" },
  { key: "domicile", label: "Domicile" },
  { key: "ocean", label: "Océan" },
  { key: "kine", label: "Kinésiologie" },
  { key: "surf", label: "Surf" },
];

export type TeamRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  role: string;
  bio: string;
  services: Service[];
  whatsapp: string | null;
  display_order: number;
  is_active: boolean;
  photo_path: string | null;
};

function publicUrl(path: string) {
  return `${env.supabaseUrl}/storage/v1/object/public/team-photos/${path}`;
}

export function TeamManager({ members }: { members: TeamRow[] }) {
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

  function readForm(form: HTMLFormElement) {
    const fd = new FormData(form);
    return {
      slug: String(fd.get("slug")).trim(),
      name: String(fd.get("name")).trim(),
      role: String(fd.get("role")),
      tagline: String(fd.get("tagline")),
      bio: String(fd.get("bio")),
      services: fd.getAll("services") as Service[],
      whatsapp: String(fd.get("whatsapp") || "") || null,
      order: Number(fd.get("order")) || 0,
      active: fd.get("active") === "on",
    };
  }

  async function uploadPhoto(member: TeamRow, file: File) {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${member.slug}.${ext}`;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.storage
      .from("team-photos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(`Upload échoué : ${error.message}`);
      return;
    }
    run(
      saveTeamMember({
        id: member.id,
        slug: member.slug,
        name: member.name,
        tagline: member.tagline,
        role: member.role,
        bio: member.bio,
        services: member.services,
        whatsapp: member.whatsapp,
        order: member.display_order,
        active: member.is_active,
        photoPath: path,
      }),
    );
  }

  return (
    <div className="space-y-8">
      {members.map((m) => (
        <form
          key={m.id}
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const v = readForm(e.currentTarget);
            run(saveTeamMember({ id: m.id, ...v, photoPath: m.photo_path }));
          }}
          className="border-filet grid gap-4 border p-5 md:grid-cols-[200px_1fr]"
        >
          <div>
            {m.photo_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicUrl(m.photo_path)}
                alt={m.name}
                className="duotone aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="bg-sand text-meta flex aspect-[4/3] items-center justify-center text-xs">
                Pas de photo
              </div>
            )}
            <label className="mt-2 block">
              <span className="eyebrow text-meta">Changer la photo</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(m, file);
                }}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug" htmlFor={`slug-${m.id}`}>
              <Input id={`slug-${m.id}`} name="slug" defaultValue={m.slug} />
            </Field>
            <Field label="Nom" htmlFor={`name-${m.id}`}>
              <Input id={`name-${m.id}`} name="name" defaultValue={m.name} />
            </Field>
            <Field label="Rôle (eyebrow)" htmlFor={`role-${m.id}`} className="sm:col-span-2">
              <Input id={`role-${m.id}`} name="role" defaultValue={m.role} />
            </Field>
            <Field label="Accroche" htmlFor={`tagline-${m.id}`} className="sm:col-span-2">
              <Input id={`tagline-${m.id}`} name="tagline" defaultValue={m.tagline} />
            </Field>
            <Field label="Bio" htmlFor={`bio-${m.id}`} className="sm:col-span-2">
              <Textarea id={`bio-${m.id}`} name="bio" defaultValue={m.bio} />
            </Field>
            <Field label="WhatsApp (ex. 33665…)" htmlFor={`wa-${m.id}`}>
              <Input id={`wa-${m.id}`} name="whatsapp" defaultValue={m.whatsapp ?? ""} />
            </Field>
            <Field label="Ordre" htmlFor={`order-${m.id}`}>
              <Input id={`order-${m.id}`} name="order" type="number" defaultValue={m.display_order} />
            </Field>
            <div className="sm:col-span-2">
              <span className="eyebrow text-meta">Services</span>
              <div className="mt-2 flex flex-wrap gap-4">
                {SERVICES.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="services"
                      value={s.key}
                      defaultChecked={m.services.includes(s.key)}
                      className="size-4"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="active" defaultChecked={m.is_active} className="size-4" />
              Actif (visible sur le site)
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" size="sm" disabled={pending}>
                Enregistrer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => run(deleteTeamMember(m.id))}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </form>
      ))}

      {/* Ajout */}
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const v = readForm(e.currentTarget);
          const form = e.currentTarget;
          run(saveTeamMember({ ...v, photoPath: null }), () => form.reset());
        }}
        className="border-filet grid gap-4 border border-dashed p-5 sm:grid-cols-2"
      >
        <p className="eyebrow sm:col-span-2">Ajouter une experte</p>
        <Field label="Slug" htmlFor="new-slug" required>
          <Input id="new-slug" name="slug" required placeholder="prenom" />
        </Field>
        <Field label="Nom" htmlFor="new-name" required>
          <Input id="new-name" name="name" required />
        </Field>
        <Field label="Rôle" htmlFor="new-role" className="sm:col-span-2">
          <Input id="new-role" name="role" />
        </Field>
        <Field label="Accroche" htmlFor="new-tagline" className="sm:col-span-2">
          <Input id="new-tagline" name="tagline" />
        </Field>
        <Field label="Bio" htmlFor="new-bio" className="sm:col-span-2">
          <Textarea id="new-bio" name="bio" />
        </Field>
        <Field label="WhatsApp" htmlFor="new-wa">
          <Input id="new-wa" name="whatsapp" />
        </Field>
        <Field label="Ordre" htmlFor="new-order">
          <Input id="new-order" name="order" type="number" defaultValue={99} />
        </Field>
        <div className="sm:col-span-2">
          <span className="eyebrow text-meta">Services</span>
          <div className="mt-2 flex flex-wrap gap-4">
            {SERVICES.map((s) => (
              <label key={s.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="services" value={s.key} className="size-4" />
                {s.label}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked className="size-4" /> Actif
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            Ajouter (photo après création)
          </Button>
        </div>
      </form>
    </div>
  );
}
