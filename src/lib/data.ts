import "server-only";
import { connection } from "next/server";
import { query, queryOne } from "@/lib/db";
import type { Locale, PropertyWithRelations, SiteSettings } from "@/types/database";

// One query per property list: translations and image metadata (never the image bytes) as JSON arrays.
const PROPERTY_SELECT = `
  SELECT p.*,
    COALESCE(
      (SELECT json_agg(t) FROM property_translations t WHERE t.property_id = p.id),
      '[]'::json
    ) AS property_translations,
    COALESCE(
      (SELECT json_agg(json_build_object(
          'id', i.id, 'property_id', i.property_id, 'caption', i.caption,
          'sort_order', i.sort_order, 'is_cover', i.is_cover, 'created_at', i.created_at
        ) ORDER BY i.sort_order)
       FROM property_images i WHERE i.property_id = p.id),
      '[]'::json
    ) AS property_images
  FROM properties p`;

function sortImages(property: PropertyWithRelations): PropertyWithRelations {
  return {
    ...property,
    property_images: [...property.property_images].sort((a, b) => {
      if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
      return a.sort_order - b.sort_order;
    }),
  };
}

// Each reader calls connection() first: pages showing live data render per request,
// never at build time (when the database may be unreachable or about to change).

export async function getPublishedProperties(): Promise<PropertyWithRelations[]> {
  await connection();
  try {
    const rows = await query<PropertyWithRelations>(
      `${PROPERTY_SELECT} WHERE p.publication_status = 'published' ORDER BY p.created_at DESC`,
    );
    return rows.map(sortImages);
  } catch (err) {
    console.error("getPublishedProperties failed:", err);
    return [];
  }
}

/** Every property regardless of publication status — admin only. */
export async function getAllProperties(): Promise<PropertyWithRelations[]> {
  await connection();
  const rows = await query<PropertyWithRelations>(`${PROPERTY_SELECT} ORDER BY p.created_at DESC`);
  return rows.map(sortImages);
}

export async function getPropertyBySlug(
  locale: Locale,
  slug: string,
): Promise<PropertyWithRelations | null> {
  await connection();
  try {
    // Switching language keeps the other locale's slug in the URL; resolve it
    // anyway so the page can redirect to this locale's slug instead of 404ing.
    const match =
      (await queryOne<{ property_id: string }>(
        "SELECT property_id FROM property_translations WHERE locale = $1 AND slug = $2",
        [locale, slug],
      )) ??
      (await queryOne<{ property_id: string }>(
        "SELECT property_id FROM property_translations WHERE slug = $1 LIMIT 1",
        [slug],
      ));
    if (!match) return null;

    const property = await queryOne<PropertyWithRelations>(
      `${PROPERTY_SELECT} WHERE p.id = $1 AND p.publication_status = 'published'`,
      [match.property_id],
    );
    return property ? sortImages(property) : null;
  } catch (err) {
    console.error("getPropertyBySlug failed:", err);
    return null;
  }
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
  await connection();
  let stored: Partial<SiteSettings> = {};
  try {
    stored = (await queryOne<SiteSettings>("SELECT * FROM site_settings WHERE id = true")) ?? {};
  } catch (err) {
    console.error("getSiteSettings failed:", err);
    return DEFAULT_SETTINGS;
  }

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
