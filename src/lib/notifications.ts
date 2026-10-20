import "server-only";
import { query, queryOne } from "@/lib/db";

interface InquiryNotificationInput {
  inquiryId: string;
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

  const job = await queryOne<{ id: string }>(
    "INSERT INTO notification_jobs (inquiry_id, channel, status) VALUES ($1, 'email', 'pending') RETURNING id",
    [input.inquiryId],
  );

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    let propertyLabel = "Demande générale";
    if (input.propertyId) {
      const translation = await queryOne<{ name: string }>(
        "SELECT name FROM property_translations WHERE property_id = $1 AND locale = 'fr'",
        [input.propertyId],
      );
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
      await query("UPDATE notification_jobs SET status = 'sent' WHERE id = $1", [job.id]);
    }
  } catch (err) {
    if (job) {
      await query(
        "UPDATE notification_jobs SET status = 'failed', attempts = 1, last_error = $1 WHERE id = $2",
        [err instanceof Error ? err.message : String(err), job.id],
      );
    }
    throw err;
  }
}
