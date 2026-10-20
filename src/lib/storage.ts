const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "property-images";

export function getPublicImageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export { BUCKET as STORAGE_BUCKET };
