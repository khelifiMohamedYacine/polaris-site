import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Locale, PropertyWithRelations, SiteSettings } from "@/types/database";

const PROPERTY_SELECT = "*, property_translations(*), property_images(*)";

function sortImages(property: PropertyWithRelations): PropertyWithRelations {
  return {
    ...property,
    property_images: [...property.property_images].sort((a, b) => {
      if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
      return a.sort_order - b.sort_order;
    }),
  };
}

export async function getPublishedProperties(): Promise<
  PropertyWithRelations[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("publication_status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedProperties failed:", error.message);
    return [];
  }
  return (data as PropertyWithRelations[]).map(sortImages);
}

export async function getPropertyBySlug(
  locale: Locale,
  slug: string,
): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();

  const { data: localeMatch } = await supabase
    .from("property_translations")
    .select("property_id")
    .eq("locale", locale)
    .eq("slug", slug)
    .maybeSingle();

  // Switching language keeps the other locale's slug in the URL; resolve it
  // anyway so the page can redirect to this locale's slug instead of 404ing.
  let translation = localeMatch;
  if (!translation) {
    const { data: anyMatch } = await supabase
      .from("property_translations")
      .select("property_id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    translation = anyMatch;
  }

  if (!translation) return null;

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("id", translation.property_id)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return sortImages(data as PropertyWithRelations);
}

/** Company details shown when the settings row is missing or a field is left empty in the admin. */
const DEFAULT_SETTINGS: SiteSettings = {
  id: true,
  company_phone: "+213 661 62 08 38",
  whatsapp_number: "+213661620838",
  company_email: "b_khelifi@hotmail.com",
  company_address: "253 Bouchaoui 2, Chéraga, Alger, Algérie",
  logo_url: null,
  bio_fr: null,
  bio_ar: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("getSiteSettings failed:", error.message);
    return DEFAULT_SETTINGS;
  }

  const stored = (data ?? {}) as Partial<SiteSettings>;
  const merged = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (stored[key] != null && stored[key] !== "") {
      (merged as Record<string, unknown>)[key] = stored[key];
    }
  }
  return merged;
}

export function translationFor(
  property: PropertyWithRelations,
  locale: Locale,
) {
  return (
    property.property_translations.find((t) => t.locale === locale) ??
    property.property_translations.find((t) => t.locale === "fr") ??
    null
  );
}
