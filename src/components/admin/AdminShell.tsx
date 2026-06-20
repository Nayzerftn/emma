import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/demandes", label: "Demandes" },
  { href: "/admin/planning-domicile", label: "Planning domicile" },
  { href: "/admin/familles", label: "Familles" },
  { href: "/admin/professeures", label: "Professeures" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/planning", label: "Planning bassin" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/contenu", label: "Contenu" },
  { href: "/admin/equipe", label: "Équipe" },
  { href: "/admin/medias", label: "Médias" },
];

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
        <nav className="border-filet border-t">
          <div className="shell no-scrollbar flex gap-6 overflow-x-auto py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="eyebrow text-ink whitespace-nowrap hover:opacity-60"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
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
