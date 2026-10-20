import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current";

const MAX_BYTES = 8 * 1024 * 1024;

/** Admin photo upload (multipart, field "files"). A route handler rather than a server action: no 1 MB body cap. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdmin())) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id: propertyId } = await params;

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  let uploaded = 0;
  const errors: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      errors.push(`${file.name} : ce n'est pas une image.`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name} : la photo doit faire moins de 8 Mo.`);
      continue;
    }

    try {
      await query(
        `INSERT INTO property_images (property_id, data, content_type, sort_order, is_cover)
         SELECT $1, $2, $3,
           COALESCE((SELECT max(sort_order) + 1 FROM property_images WHERE property_id = $1), 0),
           NOT EXISTS (SELECT 1 FROM property_images WHERE property_id = $1)`,
        [propertyId, new Uint8Array(await file.arrayBuffer()), file.type],
      );
      uploaded++;
    } catch (err) {
      console.error("image upload failed:", err);
      errors.push(`${file.name} : échec de l'envoi.`);
    }
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/projets", "page");
  revalidatePath("/[locale]/projets/[slug]", "page");

  return Response.json({ uploaded, errors });
}
