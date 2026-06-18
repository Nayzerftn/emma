"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="eyebrow underline-draw text-ink"
      onClick={async () => {
        await createSupabaseBrowserClient().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Déconnexion
    </button>
  );
}
