/**
 * Notifications semi-automatiques (brief technique v2 §5).
 * WhatsApp via liens wa.me pré-remplis (l'API WhatsApp Business complète
 * nécessite un compte Meta validé — à brancher plus tard). Emails via Resend.
 */

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
