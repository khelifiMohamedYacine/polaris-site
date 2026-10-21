import { notFound } from "next/navigation";
import Link from "next/link";
import { query, queryOne } from "@/lib/db";
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
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const property = await queryOne<Property>("SELECT * FROM properties WHERE id = $1", [id]);
  if (!property) notFound();

  const [translations, images] = await Promise.all([
    query<PropertyTranslation>("SELECT * FROM property_translations WHERE property_id = $1", [id]),
    query<PropertyImage>(
      `SELECT id, property_id, kind, caption, sort_order, is_cover, created_at
       FROM property_images WHERE property_id = $1 ORDER BY sort_order`,
      [id],
    ),
  ]);

  const fr = translations.find((t) => t.locale === "fr");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/properties" className="text-sm text-navy/60 hover:text-gold">
        ← Tous les projets
      </Link>

      <h1 className="font-display text-2xl text-navy mt-3 mb-8">
        {fr?.name || "Nouveau projet"}
      </h1>

      <div className="mb-10">
        <h2 className="font-display text-lg text-navy">Photos du bâtiment</h2>
        <p className="text-sm text-navy/60 mt-1 mb-4">
          Vues extérieures. La photo de couverture apparaît sur la carte du projet en page d&apos;accueil.
        </p>
        <ImageUploader
          propertyId={id}
          kind="building"
          images={images.filter((img) => img.kind === "building")}
        />
      </div>

      <div className="mb-10">
        <h2 className="font-display text-lg text-navy">Photos des appartements</h2>
        <p className="text-sm text-navy/60 mt-1 mb-4">
          Vues intérieures, affichées quand un visiteur ouvre le projet.
        </p>
        <ImageUploader
          propertyId={id}
          kind="interior"
          images={images.filter((img) => img.kind === "interior")}
        />
      </div>

      <PropertyForm property={property} translations={translations} />

      <div className="mt-12 pt-6 border-t border-line">
        <DeletePropertyButton propertyId={id} name={fr?.name || "ce projet"} />
      </div>
    </div>
  );
}
