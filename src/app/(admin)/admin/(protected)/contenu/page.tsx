import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export default async function AdminContenu() {
  const supabase = await createSupabaseServerClient();
  const [{ data: blocks }, { data: testimonials }, { data: faq }] = await Promise.all([
    supabase.from("content_blocks").select("id,page,key,value").order("page"),
    supabase
      .from("testimonials")
      .select("id,author,quote,display_order,published")
      .order("display_order"),
    supabase
      .from("faq_items")
      .select("id,page,question,answer,display_order,published")
      .order("page")
      .order("display_order"),
  ]);

  return (
    <>
      <AdminHeading
        title="Contenu"
        description="Textes des pages, témoignages et FAQ."
      />
      <ContentManager
        blocks={blocks ?? []}
        testimonials={testimonials ?? []}
        faq={faq ?? []}
      />
    </>
  );
}
