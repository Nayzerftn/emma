import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { AdminNav } from "./AdminNav";

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="bg-paper min-h-screen">
      <header className="border-filet sticky top-0 z-30 border-b bg-paper/95 backdrop-blur-sm">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link
            href="/admin"
            className="font-display text-ink font-black uppercase tracking-[-0.02em]"
          >
            NCB · Admin
          </Link>
          <div className="flex items-center gap-4">
            {email && <span className="text-meta hidden text-sm sm:block">{email}</span>}
            <SignOutButton />
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="shell py-10">{children}</main>
    </div>
  );
}

/** Carte statistique sobre pour le dashboard. */
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-filet border p-6">
      <p className="font-display text-ink text-4xl font-black tracking-[-0.02em]">{value}</p>
      <p className="eyebrow text-meta mt-2">{label}</p>
    </div>
  );
}

/** En-tête de page admin. */
export function AdminHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-ink text-3xl font-black uppercase tracking-[-0.02em] md:text-4xl">
        {title}
      </h1>
      {description && <p className="text-meta mt-2">{description}</p>}
    </div>
  );
}

/** État vide explicite. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-filet text-meta border border-dashed p-10 text-center">
      {children}
    </div>
  );
}
