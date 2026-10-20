"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { propertySchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import { STORAGE_BUCKET } from "@/lib/storage";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorisé.");
}

export async function createDraftProperty() {
  await assertAdmin();
  const admin = createAdminClient();
  const id = randomUUID();

  const { error } = await admin.from("properties").insert({
    id,
    city: "",
    status: "available",
    publication_status: "draft",
    price_currency: "DZD",
  });
  if (error) throw new Error(error.message);

  await admin.from("property_translations").insert([
    { property_id: id, locale: "fr", name: "Nouveau projet", slug: `nouveau-projet-${id.slice(0, 8)}` },
  ]);

  redirect(`/admin/properties/${id}`);
}

export type SavePropertyState = { error: string | null; success?: boolean };

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
  const admin = createAdminClient();

  const { error: propError } = await admin
    .from("properties")
    .update({
      city: d.city,
      neighborhood: d.neighborhood || null,
      address: d.address || null,
      status: d.status,
      is_new: d.isNew,
      units_available: d.unitsAvailable ?? null,
      price: d.price ?? null,
      price_currency: d.priceCurrency,
      show_price: d.showPrice,
      publication_status: d.publicationStatus,
    })
    .eq("id", id);

  if (propError) return { error: propError.message };

  const frSlug = `${slugify(d.nameFr)}-${id.slice(0, 6)}`;
  const { error: frError } = await admin.from("property_translations").upsert(
    {
      property_id: id,
      locale: "fr",
      name: d.nameFr,
      slug: frSlug,
      short_description: d.shortDescriptionFr || null,
      description: d.descriptionFr || null,
    },
    { onConflict: "property_id,locale" },
  );
  if (frError) return { error: frError.message };

  if (d.nameAr) {
    const arSlug = `${slugify(d.nameAr) || "projet"}-${id.slice(0, 6)}`;
    const { error: arError } = await admin.from("property_translations").upsert(
      {
        property_id: id,
        locale: "ar",
        name: d.nameAr,
        slug: arSlug,
        short_description: d.shortDescriptionAr || null,
        description: d.descriptionAr || null,
      },
      { onConflict: "property_id,locale" },
    );
    if (arError) return { error: arError.message };
  }

  revalidatePath("/admin/properties");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/projets", "page");
  revalidatePath("/[locale]/projets/[slug]", "page");

  return { error: null, success: true };
}

export async function deleteProperty(id: string) {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: images } = await admin
    .from("property_images")
    .select("storage_path")
    .eq("property_id", id);

  if (images && images.length > 0) {
    await admin.storage
      .from(STORAGE_BUCKET)
      .remove(images.map((img) => img.storage_path));
  }

  const { error } = await admin.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}

export async function setPublicationStatus(
  id: string,
  status: "draft" | "published" | "archived",
) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("properties").update({ publication_status: status }).eq("id", id);
  revalidatePath("/admin/properties");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/projets", "page");
}

export async function setPropertyStatus(
  id: string,
  status: "available" | "few_left" | "sold_out",
) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("properties").update({ status }).eq("id", id);
  revalidatePath("/admin/properties");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/projets", "page");
}

export async function attachPropertyImage(
  propertyId: string,
  storagePath: string,
) {
  await assertAdmin();
  const admin = createAdminClient();

  const { count } = await admin
    .from("property_images")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const isFirst = !count || count === 0;

  const { error } = await admin.from("property_images").insert({
    property_id: propertyId,
    storage_path: storagePath,
    sort_order: count ?? 0,
    is_cover: isFirst,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function removePropertyImage(imageId: string, propertyId: string) {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: image } = await admin
    .from("property_images")
    .select("storage_path, is_cover")
    .eq("id", imageId)
    .single();

  if (image) {
    await admin.storage.from(STORAGE_BUCKET).remove([image.storage_path]);
    await admin.from("property_images").delete().eq("id", imageId);

    if (image.is_cover) {
      const { data: next } = await admin
        .from("property_images")
        .select("id")
        .eq("property_id", propertyId)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (next) {
        await admin
          .from("property_images")
          .update({ is_cover: true })
          .eq("id", next.id);
      }
    }
  }

  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function setCoverImage(imageId: string, propertyId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId);
  await admin.from("property_images").update({ is_cover: true }).eq("id", imageId);
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function moveImage(
  imageId: string,
  propertyId: string,
  direction: "up" | "down",
) {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: images } = await admin
    .from("property_images")
    .select("id, sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });

  if (!images) return;
  const index = images.findIndex((img) => img.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= images.length) return;

  const a = images[index];
  const b = images[swapWith];

  await admin.from("property_images").update({ sort_order: b.sort_order }).eq("id", a.id);
  await admin.from("property_images").update({ sort_order: a.sort_order }).eq("id", b.id);

  revalidatePath(`/admin/properties/${propertyId}`);
}
