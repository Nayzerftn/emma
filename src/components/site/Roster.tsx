import { EditorialImage } from "@/components/site/EditorialImage";
import { Eyebrow } from "@/components/site/Typography";
import { SERVICE_LABELS } from "@/lib/content/team";
import type { TeamView } from "@/lib/content/resolvers";
import { TEAM_PHOTOS, type PhotoSlot } from "@/lib/photos";
import { env } from "@/lib/env";

function photoFor(member: TeamView): PhotoSlot {
  if (member.photoPath) {
    return {
      src: `${env.supabaseUrl}/storage/v1/object/public/team-photos/${member.photoPath}`,
      alt: `${member.name} — ${member.role}, Natation Côte Basque`,
      position: "center 25%",
    };
  }
  return (
    TEAM_PHOTOS[member.slug] ?? {
      src: `/photos/equipe/${member.slug}.jpg`,
      alt: `${member.name} — ${member.role}, Natation Côte Basque`,
      position: "center 25%",
    }
  );
}

function Card({ member }: { member: TeamView }) {
  return (
    <article className="flex flex-col">
      <EditorialImage
        slot={photoFor(member)}
        className="aspect-[4/3]"
        hoverZoom
        sizes="(min-width:768px) 45vw, 85vw"
      />
      <div className="mt-5">
        <Eyebrow>{member.role}</Eyebrow>
        <h3 className="font-display text-ink mt-2 text-3xl font-black uppercase tracking-[-0.02em]">
          {member.name}
        </h3>
        <p className="text-ink/90 mt-2 italic">«&nbsp;{member.tagline}&nbsp;»</p>
        <p className="text-meta mt-3 leading-relaxed">{member.bio}</p>
        {member.services.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {member.services.map((s) => (
              <li
                key={s}
                className="border-filet text-meta border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
              >
                {SERVICE_LABELS[s]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/**
 * Roster des expertes.
 * Mobile = slider tactile (scroll-snap, une fiche à la fois).
 * Desktop = disposition éditoriale (grille 2 colonnes lisible).
 */
export function Roster({ members }: { members: TeamView[] }) {
  return (
    <div
      className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-16 md:overflow-visible md:px-0"
      role="list"
      aria-label="Les expertes de Natation Côte Basque"
    >
      {members.map((m) => (
        <div
          key={m.slug}
          role="listitem"
          className="w-[85%] shrink-0 snap-center md:w-auto md:shrink"
        >
          <Card member={m} />
        </div>
      ))}
    </div>
  );
}
