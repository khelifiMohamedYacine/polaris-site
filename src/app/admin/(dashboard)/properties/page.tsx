import Link from "next/link";
import Image from "next/image";
import { getAllProperties } from "@/lib/data";
import { createDraftProperty } from "@/lib/actions/properties";
import { imageUrl } from "@/lib/storage";

const STATUS_LABEL: Record<string, string> = {
  available: "Disponible",
  few_left: "Dernières disponibilités",
  sold_out: "Vendu",
};
const STATUS_STYLE: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700",
  few_left: "bg-amber-50 text-amber-700",
  sold_out: "bg-stone-200 text-stone-600",
};
const PUB_LABEL: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};
const PUB_STYLE: Record<string, string> = {
  draft: "bg-navy/10 text-navy/70",
  published: "bg-gold/20 text-navy",
  archived: "bg-stone-200 text-stone-600",
};

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-display text-2xl text-navy">Nos projets</h1>
        <form action={createDraftProperty}>
          <button
            type="submit"
            className="btn-gold rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer"
          >
            + Ajouter un nouveau projet
          </button>
        </form>
      </div>

      {properties.length === 0 ? (
        <p className="text-navy/60">Aucun projet pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const fr = property.property_translations.find((t) => t.locale === "fr");
            const cover =
              property.property_images.find((i) => i.is_cover) ??
              property.property_images[0];

            return (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}`}
                className="block bg-white rounded-xl overflow-hidden ring-1 ring-line hover:ring-gold transition-colors"
              >
                <div className="relative aspect-[4/3] bg-navy/5">
                  {cover ? (
                    <Image
                      src={imageUrl(cover.id)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-navy/30 text-sm">
                      Pas de photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-navy truncate">
                    {fr?.name || "Sans titre"}
                  </p>
                  <p className="text-sm text-navy/50 truncate">
                    {property.city || "Ville non renseignée"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`text-xs rounded-full px-2.5 py-1 ${STATUS_STYLE[property.status]}`}>
                      {STATUS_LABEL[property.status]}
                    </span>
                    <span className={`text-xs rounded-full px-2.5 py-1 ${PUB_STYLE[property.publication_status]}`}>
                      {PUB_LABEL[property.publication_status]}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
