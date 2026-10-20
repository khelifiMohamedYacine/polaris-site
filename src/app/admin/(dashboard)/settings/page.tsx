import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SiteSettings } from "@/types/database";

export default async function AdminSettingsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-navy mb-2">Paramètres du site</h1>
      <p className="text-navy/60 mb-8">
        Ces informations apparaissent sur le site public (contact, pied de page, bouton WhatsApp).
      </p>
      <SettingsForm settings={data as SiteSettings | null} />
    </div>
  );
}
