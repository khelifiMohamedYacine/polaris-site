"use server";

import { query } from "@/lib/db";
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

  const reference = generateInquiryReference();
  let inquiryId: string;

  try {
    const [row] = await query<{ id: string }>(
      `INSERT INTO inquiries (reference, property_id, full_name, phone, email, message, locale)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        reference,
        parsed.data.propertyId,
        parsed.data.fullName,
        parsed.data.phone,
        parsed.data.email || null,
        parsed.data.message,
        parsed.data.locale,
      ],
    );
    inquiryId = row.id;
  } catch (err) {
    console.error("submitInquiry insert failed:", err);
    return { status: "error", message: "generic" };
  }

  // Fire-and-forget: the DB row is the source of truth, notification is best-effort.
  sendInquiryNotification({
    inquiryId,
    reference,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    message: parsed.data.message,
    propertyId: parsed.data.propertyId,
  }).catch((err) => console.error("sendInquiryNotification failed:", err));

  return { status: "success", reference };
}
