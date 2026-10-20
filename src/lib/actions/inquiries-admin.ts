"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { assertAdmin } from "@/lib/auth/current";
import type { InquiryStatus } from "@/types/database";

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await assertAdmin();
  await query("UPDATE inquiries SET status = $1 WHERE id = $2", [status, id]);
  revalidatePath("/admin/inquiries");
}

export async function addInquiryNote(id: string, note: string) {
  const admin = await assertAdmin();
  if (!note.trim()) return;
  await query(
    "INSERT INTO inquiry_notes (inquiry_id, author_id, note) VALUES ($1, $2, $3)",
    [id, admin.uid, note.trim()],
  );
  revalidatePath("/admin/inquiries");
}
