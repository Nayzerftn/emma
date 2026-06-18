"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { EmptyState } from "@/components/admin/AdminShell";

const BUCKET = "site-photos";

function publicUrl(name: string) {
  return `${env.supabaseUrl}/storage/v1/object/public/${BUCKET}/${name}`;
}

export function MediaManager() {
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function refresh() {
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setFiles((data ?? []).filter((f) => f.name && !f.name.startsWith(".")).map((f) => f.name));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUpload(file: File) {
    setBusy(true);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file.name, file, { upsert: true });
    setBusy(false);
    if (error) toast.error(`Upload échoué : ${error.message}`);
    else {
      toast.success("Photo ajoutée.");
      refresh();
    }
  }

  async function onDelete(name: string) {
    setBusy(true);
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Photo supprimée.");
      refresh();
    }
  }

  return (
    <div>
      <label className="border-filet hover:border-ink mb-8 flex cursor-pointer flex-col items-center gap-2 border border-dashed p-10 text-center">
        <span className="eyebrow">{busy ? "Envoi…" : "Cliquez pour ajouter une photo"}</span>
        <span className="text-meta text-sm">Bucket public site-photos</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </label>

      {files.length === 0 ? (
        <EmptyState>Aucune photo — ajoutez-en avec le bouton ci-dessus.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {files.map((name) => (
            <figure key={name} className="border-filet border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl(name)} alt={name} className="duotone aspect-square w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-2 p-2">
                <span className="text-meta truncate text-xs">{name}</span>
                <button
                  className="text-[0.66rem] uppercase tracking-[0.08em] underline-draw"
                  disabled={busy}
                  onClick={() => onDelete(name)}
                >
                  Suppr.
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
