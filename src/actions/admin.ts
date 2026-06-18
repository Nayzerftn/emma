"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadStatus, BookingStatus, Service } from "@/lib/supabase/types";

export type ActionResult = { ok: boolean; message?: string };

async function guard() {
  const user = await getAdminUser();
  return user ? createSupabaseAdminClient() : null;
}

const DENIED: ActionResult = { ok: false, message: "Non autorisé." };

/* ── Planning (pool_slots) ─────────────────────────────────── */
export async function createSlot(input: {
  startsAt: string;
  endsAt: string;
  audience: "enfant" | "adulte";
  level?: number | null;
  teacherId?: string | null;
  capacity: number;
  priceCents: number;
  isOpen: boolean;
}): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("pool_slots").insert({
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    audience: input.audience,
    level: input.audience === "enfant" ? (input.level ?? null) : null,
    teacher_id: input.teacherId || null,
    capacity: input.capacity,
    price_cents: input.priceCents,
    is_open: input.isOpen,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/planning");
  revalidatePath("/reservation");
  return { ok: true, message: "Créneau enregistré." };
}

export async function deleteSlot(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("pool_slots").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/planning");
  revalidatePath("/reservation");
  return { ok: true, message: "Créneau supprimé." };
}

export async function toggleSlotOpen(id: string, isOpen: boolean): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("pool_slots").update({ is_open: isOpen }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/planning");
  revalidatePath("/reservation");
  return { ok: true, message: isOpen ? "Créneau ouvert." : "Créneau fermé." };
}

/* ── Leads ─────────────────────────────────────────────────── */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/leads");
  return { ok: true, message: "Lead mis à jour." };
}

/* ── Réservations ──────────────────────────────────────────── */
export async function setBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/reservations");
  return { ok: true, message: "Réservation mise à jour." };
}

/* ── Contenu (content_blocks / testimonials / faq) ─────────── */
export async function saveContentBlock(
  page: string,
  key: string,
  value: string,
): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db
    .from("content_blocks")
    .upsert(
      { page, key, value, updated_at: new Date().toISOString() },
      { onConflict: "page,key" },
    );
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contenu");
  revalidatePath(`/${page === "home" ? "" : page}`);
  return { ok: true, message: "Contenu enregistré." };
}

export async function saveTestimonial(input: {
  id?: string;
  author: string;
  quote: string;
  order: number;
  published: boolean;
}): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const row = {
    author: input.author,
    quote: input.quote,
    display_order: input.order,
    published: input.published,
  };
  const { error } = input.id
    ? await db.from("testimonials").update(row).eq("id", input.id)
    : await db.from("testimonials").insert(row);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contenu");
  revalidatePath("/");
  return { ok: true, message: "Témoignage enregistré." };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("testimonials").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contenu");
  revalidatePath("/");
  return { ok: true, message: "Témoignage supprimé." };
}

export async function saveFaq(input: {
  id?: string;
  page: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const row = {
    page: input.page,
    question: input.question,
    answer: input.answer,
    display_order: input.order,
    published: input.published,
  };
  const { error } = input.id
    ? await db.from("faq_items").update(row).eq("id", input.id)
    : await db.from("faq_items").insert(row);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contenu");
  revalidatePath("/");
  revalidatePath("/reservation");
  return { ok: true, message: "Question enregistrée." };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("faq_items").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/contenu");
  revalidatePath("/");
  return { ok: true, message: "Question supprimée." };
}

/* ── Équipe ────────────────────────────────────────────────── */
export async function saveTeamMember(input: {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  role: string;
  bio: string;
  services: Service[];
  whatsapp?: string | null;
  order: number;
  active: boolean;
  photoPath?: string | null;
}): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const row = {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    role: input.role,
    bio: input.bio,
    services: input.services,
    whatsapp: input.whatsapp || null,
    display_order: input.order,
    is_active: input.active,
    ...(input.photoPath !== undefined ? { photo_path: input.photoPath } : {}),
  };
  const { error } = input.id
    ? await db.from("team_members").update(row).eq("id", input.id)
    : await db.from("team_members").insert(row);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
  return { ok: true, message: "Membre enregistré." };
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db.from("team_members").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
  return { ok: true, message: "Membre supprimé." };
}

export async function setTeamOrder(id: string, order: number): Promise<ActionResult> {
  const db = await guard();
  if (!db) return DENIED;
  const { error } = await db
    .from("team_members")
    .update({ display_order: order })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
  return { ok: true, message: "Ordre mis à jour." };
}
