"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { inquirySchema } from "@/lib/validation";
import { generateInquiryReference } from "@/lib/format";
import { sendInquiryNotification } from "@/lib/notifications";

export type SubmitInquiryState =
  | { status: "idle" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string };

export async function submitInquiry(
  _prevState: SubmitInquiryState,
  formData: FormData,
): Promise<SubmitInquiryState> {
  const renderedAt = Number(formData.get("renderedAt") ?? 0);
  // Reject submissions faster than a human could realistically fill the form.
  if (renderedAt && Date.now() - renderedAt < 1500) {
    return { status: "error", message: "generic" };
  }

  const parsed = inquirySchema.safeParse({
    propertyId: formData.get("propertyId") || null,
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    message: formData.get("message"),
    locale: formData.get("locale"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "generic" };
  }

  // Honeypot triggered — silently pretend success to not tip off bots.
  if (parsed.data.website) {
    return { status: "success", reference: generateInquiryReference() };
  }

  if (!isSupabaseConfigured) {
    console.error("submitInquiry skipped: Supabase is not configured");
    return { status: "error", message: "generic" };
  }

  const reference = generateInquiryReference();
  const supabase = createAdminClient();

  const { error } = await supabase.from("inquiries").insert({
    reference,
    property_id: parsed.data.propertyId,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    message: parsed.data.message,
    locale: parsed.data.locale,
  });

  if (error) {
    console.error("submitInquiry insert failed:", error.message);
    return { status: "error", message: "generic" };
  }

  // Fire-and-forget: the DB row is the source of truth, notification is best-effort.
  sendInquiryNotification({
    reference,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    message: parsed.data.message,
    propertyId: parsed.data.propertyId,
  }).catch((err) => console.error("sendInquiryNotification failed:", err));

  return { status: "success", reference };
}
