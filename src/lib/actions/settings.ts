"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { assertAdmin } from "@/lib/auth/current";

export type SaveSettingsState = { error: string | null; success?: boolean };

export async function updateSiteSettings(
  _prevState: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {
  await assertAdmin();
  const field = (name: string) => String(formData.get(name) || "") || null;

  try {
    await query(
      `UPDATE site_settings SET company_phone = $1, whatsapp_number = $2, company_email = $3,
         company_address = $4, bio_fr = $5, bio_ar = $6
       WHERE id = true`,
      [
        field("company_phone"),
        field("whatsapp_number"),
        field("company_email"),
        field("company_address"),
        field("bio_fr"),
        field("bio_ar"),
      ],
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Échec de l'enregistrement." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/contact", "page");
  return { error: null, success: true };
}
