import { requireTeacher } from "@/lib/supabase/teacher-auth";
import { ProfShell } from "@/components/prof/ProfShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mon planning | Natation Côte Basque",
  robots: { index: false },
};

export default async function ProtectedProfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const teacher = await requireTeacher();
  return <ProfShell name={teacher.name}>{children}</ProfShell>;
}
