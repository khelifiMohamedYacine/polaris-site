"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryStatus } from "@/types/database";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorisé.");
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

export async function addInquiryNote(id: string, note: string) {
  await assertAdmin();
  if (!note.trim()) return;
  const admin = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await admin.from("inquiry_notes").insert({
    inquiry_id: id,
    author_id: user?.id ?? null,
    note: note.trim(),
  });
  revalidatePath("/admin/inquiries");
}
