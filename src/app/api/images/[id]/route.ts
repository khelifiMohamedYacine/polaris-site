import { queryOne } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Serves a property photo stored in the database. Ids are random UUIDs and photos never change, so cache hard. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });

  const image = await queryOne<{ data: Uint8Array; content_type: string }>(
    "SELECT data, content_type FROM property_images WHERE id = $1",
    [id],
  );
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.content_type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
