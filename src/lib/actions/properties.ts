"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query, queryOne } from "@/lib/db";
import { assertAdmin } from "@/lib/auth/current";
import { propertySchema } from "@/lib/validation";
import { slugify } from "@/lib/format";

function revalidatePublicPages() {
  revalidatePath("/admin/properties");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/projets", "page");
  revalidatePath("/[locale]/projets/[slug]", "page");
}

export async function createDraftProperty() {
  await assertAdmin();
  const [{ id }] = await query<{ id: string }>(
    "INSERT INTO properties (city, status, publication_status) VALUES ('', 'available', 'draft') RETURNING id",
  );
  await query(
    "INSERT INTO property_translations (property_id, locale, name, slug) VALUES ($1, 'fr', 'Nouveau projet', $2)",
    [id, `nouveau-projet-${id.slice(0, 8)}`],
  );
  redirect(`/admin/properties/${id}`);
}

export type SavePropertyState = { error: string | null; success?: boolean };

async function upsertTranslation(
  propertyId: string,
  locale: "fr" | "ar",
  values: { name: string; slug: string; shortDescription: string | null; description: string | null },
) {
  await query(
    `INSERT INTO property_translations (property_id, locale, name, slug, short_description, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (property_id, locale) DO UPDATE SET
       name = EXCLUDED.name, slug = EXCLUDED.slug,
       short_description = EXCLUDED.short_description, description = EXCLUDED.description`,
    [propertyId, locale, values.name, values.slug, values.shortDescription, values.description],
  );
}

export async function updateProperty(
  id: string,
  _prevState: SavePropertyState,
  formData: FormData,
): Promise<SavePropertyState> {
  await assertAdmin();

  const parsed = propertySchema.safeParse({
    city: formData.get("city"),
    neighborhood: formData.get("neighborhood") ?? "",
    address: formData.get("address") ?? "",
    status: formData.get("status"),
    isNew: formData.get("isNew") === "on",
    unitsAvailable: formData.get("unitsAvailable") || undefined,
    price: formData.get("price") || undefined,
    priceCurrency: "DZD",
    showPrice: formData.get("showPrice") === "on",
    publicationStatus: formData.get("publicationStatus"),
    nameFr: formData.get("nameFr"),
    shortDescriptionFr: formData.get("shortDescriptionFr") ?? "",
    descriptionFr: formData.get("descriptionFr") ?? "",
    nameAr: formData.get("nameAr") ?? "",
    shortDescriptionAr: formData.get("shortDescriptionAr") ?? "",
    descriptionAr: formData.get("descriptionAr") ?? "",
  });

  if (!parsed.success) {
    return { error: "Merci de vérifier les champs obligatoires (ville, nom du projet)." };
  }

  const d = parsed.data;

  try {
    await query(
      `UPDATE properties SET
         city = $1, neighborhood = $2, address = $3, status = $4, is_new = $5,
         units_available = $6, price = $7, price_currency = $8, show_price = $9,
         publication_status = $10, updated_at = now()
       WHERE id = $11`,
      [
        d.city,
        d.neighborhood || null,
        d.address || null,
        d.status,
        d.isNew,
        d.unitsAvailable ?? null,
        d.price ?? null,
        d.priceCurrency,
        d.showPrice,
        d.publicationStatus,
        id,
      ],
    );

    await upsertTranslation(id, "fr", {
      name: d.nameFr,
      slug: `${slugify(d.nameFr)}-${id.slice(0, 6)}`,
      shortDescription: d.shortDescriptionFr || null,
      description: d.descriptionFr || null,
    });

    if (d.nameAr) {
      await upsertTranslation(id, "ar", {
        name: d.nameAr,
        slug: `${slugify(d.nameAr) || "projet"}-${id.slice(0, 6)}`,
        shortDescription: d.shortDescriptionAr || null,
        description: d.descriptionAr || null,
      });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Échec de l'enregistrement." };
  }

  revalidatePublicPages();
  return { error: null, success: true };
}

export async function deleteProperty(id: string) {
  await assertAdmin();
  // Translations and photos are removed with it (ON DELETE CASCADE).
  await query("DELETE FROM properties WHERE id = $1", [id]);
  revalidatePublicPages();
  redirect("/admin/properties");
}

export async function setPublicationStatus(
  id: string,
  status: "draft" | "published" | "archived",
) {
  await assertAdmin();
  await query("UPDATE properties SET publication_status = $1, updated_at = now() WHERE id = $2", [status, id]);
  revalidatePublicPages();
}

export async function setPropertyStatus(
  id: string,
  status: "available" | "few_left" | "sold_out",
) {
  await assertAdmin();
  await query("UPDATE properties SET status = $1, updated_at = now() WHERE id = $2", [status, id]);
  revalidatePublicPages();
}

export async function removePropertyImage(imageId: string, propertyId: string) {
  await assertAdmin();
  const image = await queryOne<{ is_cover: boolean }>(
    "DELETE FROM property_images WHERE id = $1 RETURNING is_cover",
    [imageId],
  );

  if (image?.is_cover) {
    await query(
      `UPDATE property_images SET is_cover = true WHERE id = (
         SELECT id FROM property_images WHERE property_id = $1 ORDER BY sort_order LIMIT 1
       )`,
      [propertyId],
    );
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePublicPages();
}

export async function setCoverImage(imageId: string, propertyId: string) {
  await assertAdmin();
  await query("UPDATE property_images SET is_cover = (id = $1) WHERE property_id = $2", [imageId, propertyId]);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePublicPages();
}

export async function moveImage(
  imageId: string,
  propertyId: string,
  direction: "up" | "down",
) {
  await assertAdmin();

  const images = await query<{ id: string; sort_order: number }>(
    "SELECT id, sort_order FROM property_images WHERE property_id = $1 ORDER BY sort_order",
    [propertyId],
  );

  const index = images.findIndex((img) => img.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= images.length) return;

  const a = images[index];
  const b = images[swapWith];
  await query("UPDATE property_images SET sort_order = $1 WHERE id = $2", [b.sort_order, a.id]);
  await query("UPDATE property_images SET sort_order = $1 WHERE id = $2", [a.sort_order, b.id]);

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePublicPages();
}
