"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { env, hasStripe } from "@/lib/env";
import {
  sendEmail,
  proposalCustomerEmail,
  invoiceCustomerEmail,
  invoiceReminderEmail,
  lessonConfirmationEmail,
  lessonCancellationEmail,
  adminAlertEmail,
} from "@/lib/email";
import { formatWhenParis } from "@/lib/platform/notify";
import { formatEuros } from "@/lib/utils";
import {
  lessonPriceCents,
  teacherPayoutCents,
  buildInvoiceLines,
  isChargeable,
} from "@/lib/platform/billing";
import { canSchedule, type PlanSlot } from "@/lib/platform/planning";
import type {
  RequestStatus,
  LessonStatus,
  LessonDuration,
  InvoiceStatus,
} from "@/lib/supabase/types";

export type ActionResult = { ok: boolean; message?: string };

async function guard() {
  const user = await getAdminUser();
  return user ? createSupabaseAdminClient() : null;
}
const DENIED: ActionResult = { ok: false, message: "Non autorisé." };

function dayBounds(iso: string): { start: string; end: string } {
  const d = new Date(iso);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

/* ── Demandes (lesson_requests) ────────────────────────────── */
export async function setRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db
    .from("lesson_requests")
    .update({ status, status_changed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/demandes");
  return { ok: true, message: "Demande mise à jour." };
}

/** Propose une professeure : lie + passe en « proposé » + email au client. */
export async function proposeRequest(
  id: string,
  teacherId: string,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { data: req } = await db
    .from("lesson_requests")
    .select("name,email,type")
    .eq("id", id)
    .single();
  const { data: teacher } = await db
    .from("team_members")
    .select("name")
    .eq("id", teacherId)
    .single();
  if (!req || !teacher) return { ok: false, message: "Demande ou professeure introuvable." };

  const { error } = await db
    .from("lesson_requests")
    .update({
      matched_teacher_id: teacherId,
      status: "proposed",
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  if (req.email) {
    await sendEmail({
      to: req.email,
      subject: "Votre professeure — Natation Côte Basque",
      html: proposalCustomerEmail({
        clientName: req.name,
        teacherName: teacher.name,
        type: req.type,
      }),
    }).catch((e) => console.error("[propose:email]", e));
  }
  revalidatePath("/admin/demandes");
  return { ok: true, message: `Proposé : ${teacher.name}.` };
}

export type NewLessonInput = {
  teacherId: string;
  clientId?: string | null;
  requestId?: string | null;
  studentName?: string | null;
  startsAt: string; // ISO
  durationMin: LessonDuration;
  zone?: string | null;
  address?: string | null;
};

/** Vérifie la règle de battement (30 min) pour une professeure ce jour-là. */
async function battementOk(
  db: NonNullable<Awaited<ReturnType<typeof guard>>>,
  teacherId: string,
  startsAt: string,
  durationMin: LessonDuration,
  ignoreLessonId?: string,
): Promise<boolean> {
  const { start, end } = dayBounds(startsAt);
  const { data } = await db
    .from("lessons")
    .select("id,starts_at,duration_min,status")
    .eq("teacher_id", teacherId)
    .gte("starts_at", start)
    .lte("starts_at", end)
    .in("status", ["scheduled", "done"]);
  const existing: PlanSlot[] = (data ?? [])
    .filter((l) => l.id !== ignoreLessonId)
    .map((l) => ({ startsAt: new Date(l.starts_at), durationMin: l.duration_min }));
  return canSchedule(existing, { startsAt: new Date(startsAt), durationMin });
}

async function insertLesson(
  db: NonNullable<Awaited<ReturnType<typeof guard>>>,
  input: NewLessonInput,
): Promise<{ ok: boolean; message?: string }> {
  if (!(await battementOk(db, input.teacherId, input.startsAt, input.durationMin))) {
    return { ok: false, message: "Conflit : moins de 30 min de battement avec un autre cours." };
  }
  const { error } = await db.from("lessons").insert({
    request_id: input.requestId ?? null,
    client_id: input.clientId ?? null,
    teacher_id: input.teacherId,
    student_name: input.studentName ?? null,
    starts_at: input.startsAt,
    duration_min: input.durationMin,
    zone: input.zone ?? null,
    address: input.address ?? null,
    price_cents: lessonPriceCents(input.durationMin),
    payout_cents: teacherPayoutCents(input.durationMin),
    status: "scheduled",
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Crée un cours isolé (planning manuel). */
export async function createLesson(input: NewLessonInput): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const res = await insertLesson(db, input);
  if (!res.ok) return res;
  revalidatePath("/admin/planning-domicile");
  revalidatePath("/admin/familles");
  return { ok: true, message: "Cours planifié." };
}

/** Confirme une demande : crée les cours proposés puis passe en « confirmé ». */
export async function confirmRequestLessons(
  requestId: string,
  lessons: Omit<NewLessonInput, "requestId" | "clientId">[],
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  if (lessons.length === 0) return { ok: false, message: "Aucun cours à créer." };

  const { data: req } = await db
    .from("lesson_requests")
    .select("client_id,student_name,zone,address,matched_teacher_id")
    .eq("id", requestId)
    .single();
  if (!req) return { ok: false, message: "Demande introuvable." };

  for (const [i, l] of lessons.entries()) {
    const res = await insertLesson(db, {
      ...l,
      requestId,
      clientId: req.client_id,
      studentName: l.studentName ?? req.student_name,
      zone: l.zone ?? req.zone,
      address: l.address ?? req.address,
    });
    if (!res.ok) return { ok: false, message: `Cours ${i + 1} : ${res.message}` };
  }

  const teacherId = req.matched_teacher_id ?? lessons[0].teacherId;
  await db
    .from("lesson_requests")
    .update({
      status: "confirmed",
      matched_teacher_id: teacherId,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  // Email de confirmation au client (récap des cours).
  if (req.client_id) {
    const [{ data: client }, { data: teacher }] = await Promise.all([
      db.from("clients").select("name,email").eq("id", req.client_id).single(),
      db.from("team_members").select("name").eq("id", teacherId).single(),
    ]);
    if (client?.email) {
      await sendEmail({
        to: client.email,
        subject: "Vos cours sont confirmés — Natation Côte Basque",
        html: lessonConfirmationEmail({
          clientName: client.name,
          teacherName: teacher?.name ?? "votre professeure",
          lessons: lessons.map((l) => ({
            when: formatWhenParis(l.startsAt),
            duration: l.durationMin,
          })),
        }),
      }).catch((e) => console.error("[confirm:email]", e));
    }
  }

  revalidatePath("/admin/demandes");
  revalidatePath("/admin/planning-domicile");
  revalidatePath("/admin/familles");
  return { ok: true, message: `${lessons.length} cours planifié(s).` };
}

/* ── Cours (lessons) ───────────────────────────────────────── */
export async function updateLessonStatus(
  id: string,
  status: LessonStatus,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("lessons").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };

  // Notifications d'annulation (client) + alerte Eléa si annulation < 48h.
  if (status === "cancelled" || status === "cancelled_late") {
    const late = status === "cancelled_late";
    const { data: lesson } = await db
      .from("lessons")
      .select("starts_at,client_id,student_name")
      .eq("id", id)
      .single();
    if (lesson?.client_id) {
      const { data: client } = await db
        .from("clients")
        .select("name,email")
        .eq("id", lesson.client_id)
        .single();
      if (client?.email) {
        await sendEmail({
          to: client.email,
          subject: "Cours annulé — Natation Côte Basque",
          html: lessonCancellationEmail({
            clientName: client.name,
            when: formatWhenParis(lesson.starts_at),
            late,
          }),
        }).catch((e) => console.error("[cancel:email]", e));
      }
      if (late && env.adminEmail) {
        await sendEmail({
          to: env.adminEmail,
          subject: "⚠ Cours annulé < 48h (dû) — Natation Côte Basque",
          html: adminAlertEmail("Annulation tardive (< 48h)", [
            `Cours du ${formatWhenParis(lesson.starts_at)}${lesson.student_name ? ` (${lesson.student_name})` : ""} annulé à moins de 48h.`,
            "Ce cours reste dû — pensez à le facturer.",
          ]),
        }).catch((e) => console.error("[cancel:alert]", e));
      }
    }
  }

  revalidatePath("/admin/planning-domicile");
  revalidatePath("/admin/familles");
  return { ok: true, message: "Cours mis à jour." };
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("lessons").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/planning-domicile");
  revalidatePath("/admin/familles");
  return { ok: true, message: "Cours supprimé." };
}

/* ── Réglages professeures (teacher_settings) ──────────────── */
export async function saveTeacherSettings(input: {
  teacherId: string;
  zones: string[];
  maxPerDay: number;
  payout30Cents: number;
  payout60Cents: number;
  availability: { base: { weekday: number; parts: string[] }[]; exceptions: { date: string; off?: boolean }[] };
}): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("teacher_settings").upsert(
    {
      teacher_id: input.teacherId,
      zones: input.zones,
      max_per_day: input.maxPerDay,
      payout_30_cents: input.payout30Cents,
      payout_60_cents: input.payout60Cents,
      availability: input.availability,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "teacher_id" },
  );
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/professeures");
  revalidatePath("/admin/demandes");
  return { ok: true, message: "Réglages enregistrés." };
}

/* ── Facturation (invoices) ────────────────────────────────── */
/** Génère une facture pour un client (cours facturables) + lien de paiement Stripe. */
export async function generateInvoice(input: {
  clientId: string;
  periodLabel: string;
  fromISO?: string | null;
  toISO?: string | null;
}): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;

  const { data: client } = await db
    .from("clients")
    .select("name,email")
    .eq("id", input.clientId)
    .single();
  if (!client) return { ok: false, message: "Client introuvable." };

  let q = db
    .from("lessons")
    .select("id,duration_min,status,starts_at")
    .eq("client_id", input.clientId)
    .is("invoice_id", null); // anti-double-facturation : seulement les cours non encore facturés
  if (input.fromISO) q = q.gte("starts_at", input.fromISO);
  if (input.toISO) q = q.lte("starts_at", input.toISO);
  const { data: lessons } = await q;

  const chargeable = (lessons ?? []).filter((l) => isChargeable(l.status));
  if (chargeable.length === 0) {
    return { ok: false, message: "Aucun cours facturable sur la période." };
  }
  const lines = buildInvoiceLines(
    chargeable.map((l) => ({ duration_min: l.duration_min, status: l.status })),
  );
  const total = lines.reduce((s, l) => s + l.amount_cents, 0);

  // 1) Insérer la facture (pending) pour obtenir son id.
  const { data: invoice, error: insErr } = await db
    .from("invoices")
    .insert({
      client_id: input.clientId,
      client_name: client.name,
      period_label: input.periodLabel,
      lines,
      total_cents: total,
      status: "pending",
    })
    .select("id")
    .single();
  if (insErr || !invoice) return { ok: false, message: insErr?.message ?? "Échec." };

  // 1b) Rattacher les cours facturés à cette facture (empêche tout re-comptage).
  const { error: linkErr } = await db
    .from("lessons")
    .update({ invoice_id: invoice.id })
    .in(
      "id",
      chargeable.map((l) => l.id),
    );
  if (linkErr) console.error("[invoice:link-lessons]", linkErr);

  // 2) Lien de paiement Stripe (si configuré).
  let stripeUrl: string | null = null;
  if (hasStripe) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lines.map((l) => ({
          price_data: {
            currency: "eur",
            product_data: { name: l.label },
            unit_amount: l.amount_cents,
          },
          quantity: 1,
        })),
        metadata: { invoice_id: invoice.id },
        customer_email: client.email ?? undefined,
        success_url: `${env.siteUrl}/admin/familles?paid=1`,
        cancel_url: `${env.siteUrl}/admin/familles`,
      });
      stripeUrl = session.url;
      await db.from("invoices").update({ stripe_url: stripeUrl }).eq("id", invoice.id);
    } catch (e) {
      console.error("[invoice:stripe]", e);
    }
  }

  // 3) Email au client (avec lien si dispo).
  if (client.email) {
    await sendEmail({
      to: client.email,
      subject: "Votre facture — Natation Côte Basque",
      html: invoiceCustomerEmail({
        clientName: client.name,
        total: formatEuros(total),
        url: stripeUrl,
        lines,
      }),
    }).catch((e) => console.error("[invoice:email]", e));
  }

  revalidatePath("/admin/familles");
  return {
    ok: true,
    message: `Facture ${formatEuros(total)} créée${stripeUrl ? " avec lien de paiement" : ""}.`,
  };
}

export async function setInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("invoices").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/familles");
  return { ok: true, message: "Facture mise à jour." };
}

export async function sendInvoiceReminder(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { data: inv } = await db
    .from("invoices")
    .select("client_name,total_cents,stripe_url,client_id")
    .eq("id", id)
    .single();
  if (!inv) return { ok: false, message: "Facture introuvable." };
  let email: string | null = null;
  if (inv.client_id) {
    const { data: c } = await db.from("clients").select("email").eq("id", inv.client_id).single();
    email = c?.email ?? null;
  }
  if (!email) return { ok: false, message: "Pas d'email client — relancez par WhatsApp." };
  await sendEmail({
    to: email,
    subject: "Rappel — facture Natation Côte Basque",
    html: invoiceReminderEmail({
      clientName: inv.client_name,
      total: formatEuros(inv.total_cents),
      url: inv.stripe_url,
    }),
  });
  revalidatePath("/admin/familles");
  return { ok: true, message: "Relance envoyée." };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("invoices").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/familles");
  return { ok: true, message: "Facture supprimée." };
}
