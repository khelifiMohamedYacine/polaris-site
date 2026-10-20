import { query } from "@/lib/db";
import { InquiriesTable } from "@/components/admin/InquiriesTable";
import type { Inquiry, InquiryNote } from "@/types/database";

export default async function AdminInquiriesPage() {
  const [inquiries, translations, notes] = await Promise.all([
    query<Inquiry>("SELECT * FROM inquiries ORDER BY created_at DESC"),
    query<{ property_id: string; name: string }>(
      "SELECT property_id, name FROM property_translations WHERE locale = 'fr'",
    ),
    query<InquiryNote>("SELECT * FROM inquiry_notes ORDER BY created_at ASC"),
  ]);

  const propertyNames = new Map(translations.map((t) => [t.property_id, t.name]));
  const notesByInquiry = new Map<string, InquiryNote[]>();
  for (const note of notes) {
    const list = notesByInquiry.get(note.inquiry_id) ?? [];
    list.push(note);
    notesByInquiry.set(note.inquiry_id, list);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-8">Demandes reçues</h1>
      <InquiriesTable
        inquiries={inquiries}
        propertyNames={Object.fromEntries(propertyNames)}
        notesByInquiry={Object.fromEntries(notesByInquiry)}
      />
    </div>
  );
}
