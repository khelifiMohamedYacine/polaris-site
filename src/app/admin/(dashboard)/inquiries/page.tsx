import { createAdminClient } from "@/lib/supabase/admin";
import { InquiriesTable } from "@/components/admin/InquiriesTable";
import type { Inquiry, InquiryNote } from "@/types/database";

export default async function AdminInquiriesPage() {
  const admin = createAdminClient();

  const [{ data: inquiries }, { data: translations }, { data: notes }] =
    await Promise.all([
      admin.from("inquiries").select("*").order("created_at", { ascending: false }),
      admin.from("property_translations").select("property_id, name").eq("locale", "fr"),
      admin.from("inquiry_notes").select("*").order("created_at", { ascending: true }),
    ]);

  const propertyNames = new Map(
    (translations ?? []).map((t) => [t.property_id, t.name]),
  );
  const notesByInquiry = new Map<string, InquiryNote[]>();
  for (const note of (notes as InquiryNote[] | null) ?? []) {
    const list = notesByInquiry.get(note.inquiry_id) ?? [];
    list.push(note);
    notesByInquiry.set(note.inquiry_id, list);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-8">Demandes reçues</h1>
      <InquiriesTable
        inquiries={(inquiries as Inquiry[] | null) ?? []}
        propertyNames={Object.fromEntries(propertyNames)}
        notesByInquiry={Object.fromEntries(notesByInquiry)}
      />
    </div>
  );
}
