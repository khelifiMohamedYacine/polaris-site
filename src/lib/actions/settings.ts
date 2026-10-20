"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorisé.");
}

export type SaveSettingsState = { error: string | null; success?: boolean };

export async function updateSiteSettings(
  _prevState: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {
  await assertAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("site_settings")
    .update({
      company_phone: String(formData.get("company_phone") || "") || null,
      whatsapp_number: String(formData.get("whatsapp_number") || "") || null,
      company_email: String(formData.get("company_email") || "") || null,
      company_address: String(formData.get("company_address") || "") || null,
      bio_fr: String(formData.get("bio_fr") || "") || null,
      bio_ar: String(formData.get("bio_ar") || "") || null,
    })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/contact", "page");
  return { error: null, success: true };
}
