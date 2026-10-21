import "server-only";
import { hashPassword } from "@/lib/auth/password";

/**
 * Full schema, idempotent: every statement can run on each start-up, so a new
 * empty database (Render, or the local embedded one) is created automatically.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL DEFAULT '',
  neighborhood text,
  address text,
  lat double precision,
  lng double precision,
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'few_left', 'sold_out')),
  is_new boolean NOT NULL DEFAULT false,
  units_available integer,
  price double precision,
  price_currency text NOT NULL DEFAULT 'DZD',
  show_price boolean NOT NULL DEFAULT false,
  publication_status text NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('fr', 'ar')),
  name text NOT NULL,
  slug text NOT NULL,
  short_description text,
  description text,
  UNIQUE (locale, slug),
  UNIQUE (property_id, locale)
);
CREATE INDEX IF NOT EXISTS property_translations_property_idx ON property_translations (property_id);

-- Photos live in the database itself (no external storage service needed).
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  data bytea NOT NULL,
  content_type text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS property_images_property_idx ON property_images (property_id);
-- 'building': outside shots, one of them the cover on project cards. 'interior': apartment photos.
ALTER TABLE property_images ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'building'
  CHECK (kind IN ('building', 'interior'));

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  locale text NOT NULL DEFAULT 'fr',
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'visit_planned', 'completed', 'spam')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_property_idx ON inquiries (property_id);

CREATE TABLE IF NOT EXISTS inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  author_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  company_phone text,
  whatsapp_number text,
  company_email text,
  company_address text,
  logo_url text,
  bio_fr text,
  bio_ar text
);
INSERT INTO site_settings (id, company_phone, whatsapp_number, company_email, company_address)
VALUES (true, '+213 661 62 08 38', '+213661620838', 'b_khelifi@hotmail.com', '253 Bouchaoui 2, Chéraga, Alger, Algérie')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES inquiries(id) ON DELETE CASCADE,
  channel text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

type Exec = {
  exec(sql: string): Promise<unknown>;
  query(text: string, params?: unknown[]): Promise<unknown>;
};

/**
 * Creates missing tables, then makes the ADMIN_EMAIL / ADMIN_PASSWORD account
 * match the environment — so changing ADMIN_PASSWORD on the host and
 * restarting is how the admin password is set or reset.
 */
export async function initDatabase(db: Exec) {
  await db.exec(SCHEMA_SQL);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    await db.query(
      `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, await hashPassword(password)],
    );
  }
}
