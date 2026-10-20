import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

interface InquiryNotificationInput {
  reference: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string;
  propertyId: string | null;
}

/**
 * Sends an email notification for a new inquiry. Does nothing (but still
 * succeeds) if RESEND_API_KEY is not configured — the inquiry is already
 * saved in the database either way, so this is purely best-effort.
 */
export async function sendInquiryNotification(input: InquiryNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL_TO;
  const from = process.env.NOTIFICATION_EMAIL_FROM;

  if (!apiKey || !to || !from) {
    return;
  }

  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("notification_jobs")
    .insert({ channel: "email", status: "pending" })
    .select("id")
    .single();

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    let propertyLabel = "Demande générale";
    if (input.propertyId) {
      const { data: translation } = await supabase
        .from("property_translations")
        .select("name")
        .eq("property_id", input.propertyId)
        .eq("locale", "fr")
        .maybeSingle();
      if (translation?.name) propertyLabel = translation.name;
    }

    await resend.emails.send({
      from,
      to,
      subject: `Nouvelle demande — ${propertyLabel} (${input.reference})`,
      text: [
        `Référence : ${input.reference}`,
        `Projet : ${propertyLabel}`,
        `Nom : ${input.fullName}`,
        `Téléphone : ${input.phone}`,
        input.email ? `E-mail : ${input.email}` : null,
        "",
        "Message :",
        input.message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (job) {
      await supabase
        .from("notification_jobs")
        .update({ status: "sent" })
        .eq("id", job.id);
    }
  } catch (err) {
    if (job) {
      await supabase
        .from("notification_jobs")
        .update({
          status: "failed",
          attempts: 1,
          last_error: err instanceof Error ? err.message : String(err),
        })
        .eq("id", job.id);
    }
    throw err;
  }
}
