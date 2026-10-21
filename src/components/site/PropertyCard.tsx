import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale, PropertyWithRelations } from "@/types/database";
import { translationFor } from "@/lib/data";
import { imageUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { StatusBadge, NewBadge } from "./StatusBadge";

export function PropertyCard({
  property,
}: {
  property: PropertyWithRelations;
}) {
  const t = useTranslations("properties");
  const locale = useLocale() as Locale;
  const translation = translationFor(property, locale);
  // Images arrive cover-first; the card always shows a building photo, never an interior one.
  const cover = property.property_images.find((img) => img.kind === "building");

  if (!translation) return null;

  return (
    <Link
      href={{ pathname: "/projets/[slug]", params: { slug: translation.slug } }}
      className="group block bg-white rounded-2xl overflow-hidden card-shadow transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] bg-navy-light">
        {cover ? (
          <Image
            src={imageUrl(cover.id)}
            alt={translation.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ivory/40 text-sm">
            POLARIS Construction
          </div>
        )}
        <div className="absolute top-3 start-3 flex gap-2">
          <StatusBadge status={property.status} />
          {property.is_new && <NewBadge />}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg text-navy">{translation.name}</h3>
        <p className="mt-1 text-sm text-navy/60">
          {[property.neighborhood, property.city].filter(Boolean).join(", ")}
        </p>
        {translation.short_description && (
          <p className="mt-2 text-sm text-navy/70 line-clamp-2">
            {translation.short_description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-navy">
            {property.show_price && property.price
              ? formatPrice(property.price, property.price_currency, locale)
              : t("priceOnRequest")}
          </span>
          <span className="text-sm font-medium text-gold group-hover:underline">
            {t("viewProject")} {locale === "ar" ? "←" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}
