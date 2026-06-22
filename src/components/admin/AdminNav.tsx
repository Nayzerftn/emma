"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/demandes", label: "Demandes" },
  { href: "/admin/planning-domicile", label: "Planning domicile" },
  { href: "/admin/familles", label: "Familles" },
  { href: "/admin/paie", label: "Paie" },
  { href: "/admin/professeures", label: "Professeures" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/planning", label: "Planning bassin" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/contenu", label: "Contenu" },
  { href: "/admin/equipe", label: "Équipe" },
  { href: "/admin/medias", label: "Médias" },
];

/** Navigation admin avec indicateur de page active (souligné éditorial). */
export function AdminNav() {
  const pathname = usePathname();

  // "/admin" actif seulement en exact ; les autres en exact ou sous-route.
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="border-filet border-t">
      <div className="shell no-scrollbar flex gap-6 overflow-x-auto py-3">
        {NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "eyebrow whitespace-nowrap border-b-2 pb-1 transition-colors duration-200",
                active
                  ? "border-ink text-ink"
                  : "border-transparent text-meta hover:text-ink",
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
