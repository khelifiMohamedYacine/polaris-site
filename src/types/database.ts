export type PropertyStatus = "available" | "few_left" | "sold_out";
export type PublicationStatus = "draft" | "published" | "archived";
export type InquiryStatus =
  | "new"
  | "contacted"
  | "visit_planned"
  | "completed"
  | "spam";
export type Locale = "fr" | "ar";

export interface Property {
  id: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: PropertyStatus;
  is_new: boolean;
  units_available: number | null;
  price: number | null;
  price_currency: string;
  show_price: boolean;
  publication_status: PublicationStatus;
  created_at: string;
  updated_at: string;
}

export interface PropertyTranslation {
  id: string;
  property_id: string;
  locale: Locale;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Inquiry {
  id: string;
  reference: string;
  property_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  locale: Locale;
  status: InquiryStatus;
  created_at: string;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  author_id: string | null;
  note: string;
  created_at: string;
}

export interface SiteSettings {
  id: boolean;
  company_phone: string | null;
  whatsapp_number: string | null;
  company_email: string | null;
  company_address: string | null;
  logo_url: string | null;
  bio_fr: string | null;
  bio_ar: string | null;
}

/** Property joined with its translations and images, as used across the public site and admin. */
export interface PropertyWithRelations extends Property {
  property_translations: PropertyTranslation[];
  property_images: PropertyImage[];
}
