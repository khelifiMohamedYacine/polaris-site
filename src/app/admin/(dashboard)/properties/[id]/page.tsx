import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DeletePropertyButton } from "@/components/admin/DeletePropertyButton";
import type { Property, PropertyTranslation, PropertyImage } from "@/types/database";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: property } = await admin
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!property) notFound();

  const [{ data: translations }, { data: images }] = await Promise.all([
    admin.from("property_translations").select("*").eq("property_id", id),
    admin
      .from("property_images")
      .select("*")
      .eq("property_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const fr = (translations as PropertyTranslation[] | null)?.find(
    (t) => t.locale === "fr",
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin/properties" className="text-sm text-navy/60 hover:text-gold">
        ← Tous les projets
      </Link>

      <h1 className="font-display text-2xl text-navy mt-3 mb-8">
        {fr?.name || "Nouveau projet"}
      </h1>

      <div className="mb-10">
        <h2 className="font-display text-lg text-navy mb-4">Photos</h2>
        <ImageUploader
          propertyId={id}
          images={(images as PropertyImage[] | null) ?? []}
        />
      </div>

      <PropertyForm
        property={property as Property}
        translations={(translations as PropertyTranslation[] | null) ?? []}
      />

      <div className="mt-12 pt-6 border-t border-line">
        <DeletePropertyButton propertyId={id} name={fr?.name || "ce projet"} />
      </div>
    </div>
  );
}
