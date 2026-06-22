/**
 * Notifications semi-automatiques (brief technique v2 §5).
 * WhatsApp via liens wa.me pré-remplis (l'API WhatsApp Business complète
 * nécessite un compte Meta validé — à brancher plus tard). Emails via Resend.
 */

/**
 * Formate un instant ISO en « lundi 6 juillet à 10h00 » — toujours en heure
 * de Paris (sûr même si le serveur tourne en UTC, ex. Vercel).
 */
export function formatWhenParis(iso: string): string {
  const s = new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
  // "lundi 6 juillet, 10:00" → "lundi 6 juillet à 10h00"
  return s.replace(", ", " à ").replace(":", "h");
}

/** Normalise un numéro FR en format international pour wa.me. */
export function waFromPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "33" + digits.slice(1);
  if (digits.startsWith("33") === false && digits.length === 9) digits = "33" + digits;
  return digits;
}

/** Lien WhatsApp pré-rempli. */
export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${waFromPhone(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const typeLabel = (type: "domicile" | "ocean") =>
  type === "ocean" ? "initiation océan" : "cours de natation à domicile";

/** Message de proposition de professeure (WhatsApp). */
export function proposalMessage(input: {
  clientName: string;
  teacherName: string;
  studentName?: string | null;
  type: "domicile" | "ocean";
}): string {
  const who = input.studentName ? ` pour ${input.studentName}` : "";
  return `Bonjour ${input.clientName}, c'est l'équipe Natation Côte Basque. Pour votre demande de ${typeLabel(
    input.type,
  )}${who}, nous vous proposons ${input.teacherName}. Elle vous contactera pour caler les créneaux. On confirme ?`;
}

/** Message de proposition COMPLET avec les créneaux (WhatsApp semi-auto). */
export function proposalWithSlotsMessage(input: {
  clientName: string;
  teacherName: string;
  type: "domicile" | "ocean";
  slots: string[]; // déjà formatés, ex. "lundi 6 juillet à 10h00"
}): string {
  const who = input.slots.length ? `\n\nCréneaux possibles :\n${input.slots.map((s, i) => `${i + 1}. ${s}`).join("\n")}` : "";
  return `Bonjour ${input.clientName}, c'est l'équipe Natation Côte Basque 🏊\n\nPour votre ${typeLabel(
    input.type,
  )}, nous vous proposons ${input.teacherName}.${who}\n\nRépondez OUI pour valider, ou NON / MODIFIER si vous préférez d'autres créneaux. À très vite !`;
}

/** Message de relance de paiement (WhatsApp / email). */
export function reminderMessage(input: {
  clientName: string;
  total: string;
  url?: string | null;
}): string {
  return `Bonjour ${input.clientName}, petit rappel concernant votre facture Natation Côte Basque (${input.total}).${
    input.url ? ` Vous pouvez régler ici : ${input.url}` : ""
  } Merci !`;
}
