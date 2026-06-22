"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** En-tête mobile ultra-simple de l'espace professeure. */
export function ProfShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="bg-paper min-h-screen">
      <header className="border-filet sticky top-0 z-30 border-b bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <span className="font-display text-ink text-sm font-black uppercase tracking-[-0.02em]">
            NCB · {name}
          </span>
          <button
            type="button"
            className="eyebrow text-meta hover:text-ink"
            onClick={async () => {
              await createSupabaseBrowserClient().auth.signOut();
              router.push("/prof/login");
              router.refresh();
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
