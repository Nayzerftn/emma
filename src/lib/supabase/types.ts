/**
 * Types de la base Supabase (maintenus en cohérence avec supabase/migrations).
 * Montants & prix en entiers (centimes).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Service = "bassin" | "domicile" | "ocean" | "kine" | "surf";
export type SlotAudience = "enfant" | "adulte";
export type BookingStatus = "pending" | "paid" | "failed" | "cancelled";
export type LeadType = "domicile" | "ocean";
export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export type TeamMemberRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  role: string;
  bio: string;
  photo_path: string | null;
  services: Service[];
  whatsapp: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type PoolSlotRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  audience: SlotAudience;
  level: number | null;
  teacher_id: string | null;
  capacity: number;
  booked_count: number;
  price_cents: number;
  is_open: boolean;
  created_at: string;
};

export type BookingRow = {
  id: string;
  slot_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participant_name: string;
  participant_age: number | null;
  amount_cents: number;
  status: BookingStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
};

export type LeadRow = {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  level: string | null;
  availability: string | null;
  group_size: string | null;
  message: string | null;
  status: LeadStatus;
  assigned_teacher_id: string | null;
  created_at: string;
};

export type ContentBlockRow = {
  id: string;
  page: string;
  key: string;
  value: string;
  updated_at: string;
};

export type TestimonialRow = {
  id: string;
  author: string;
  location: string | null;
  context: string | null;
  quote: string;
  display_order: number;
  published: boolean;
  created_at: string;
};

export type FaqItemRow = {
  id: string;
  page: string;
  question: string;
  answer: string;
  display_order: number;
  published: boolean;
  created_at: string;
};

export type AdminRow = { id: string; email: string; created_at: string };
export type StripeEventRow = { id: string; type: string; received_at: string };

/* ── Plateforme opérationnelle (domicile / océan) ── */
export type LessonDuration = 30 | 60;
export type RequestStatus =
  | "new"
  | "matching"
  | "proposed"
  | "confirmed"
  | "to_retreat"
  | "lost";
export type LessonStatus = "scheduled" | "done" | "cancelled" | "cancelled_late";
export type InvoiceStatus = "pending" | "paid" | "late";

export type TeacherSettingsRow = {
  teacher_id: string;
  zones: string[];
  max_per_day: number;
  payout_30_cents: number;
  payout_60_cents: number;
  availability: {
    base: { weekday: number; parts: string[] }[];
    exceptions: { date: string; off?: boolean }[];
  };
  updated_at: string;
};

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type LessonRequestRow = {
  id: string;
  client_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  type: LeadType;
  zone: string | null;
  address: string | null;
  student_name: string | null;
  student_age: number | null;
  student_level: string | null;
  objective: string | null;
  weeks: string | null;
  slots_wanted: string | null;
  frequency: string | null;
  duration_min: LessonDuration;
  nb_courses: number | null;
  preferred_teacher_id: string | null;
  message: string | null;
  source: "site" | "google_form" | "manual";
  status: RequestStatus;
  matched_teacher_id: string | null;
  status_changed_at: string;
  created_at: string;
};

export type LessonRow = {
  id: string;
  request_id: string | null;
  client_id: string | null;
  teacher_id: string;
  student_name: string | null;
  starts_at: string;
  duration_min: LessonDuration;
  zone: string | null;
  address: string | null;
  price_cents: number;
  payout_cents: number;
  status: LessonStatus;
  invoice_id: string | null;
  created_at: string;
};

export type InvoiceLine = { label: string; amount_cents: number };
export type InvoiceRow = {
  id: string;
  client_id: string | null;
  client_name: string;
  period_label: string | null;
  lines: InvoiceLine[];
  total_cents: number;
  status: InvoiceStatus;
  stripe_url: string | null;
  created_at: string;
};

type TableShape<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      team_members: TableShape<TeamMemberRow>;
      pool_slots: TableShape<PoolSlotRow>;
      bookings: TableShape<BookingRow>;
      leads: TableShape<LeadRow>;
      content_blocks: TableShape<ContentBlockRow>;
      testimonials: TableShape<TestimonialRow>;
      faq_items: TableShape<FaqItemRow>;
      admins: TableShape<AdminRow>;
      stripe_events: TableShape<StripeEventRow>;
      teacher_settings: TableShape<TeacherSettingsRow>;
      clients: TableShape<ClientRow>;
      lesson_requests: TableShape<LessonRequestRow>;
      lessons: TableShape<LessonRow>;
      invoices: TableShape<InvoiceRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
