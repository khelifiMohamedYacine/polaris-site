import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale, PropertyWithRelations } from "@/types/database";
import { translationFor } from "@/lib/data";
import { imageUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { StatusBadge, NewBadge } from "./StatusBadge";
import { ArrowIcon, BuildingIcon, PinIcon } from "./icons";

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

  const place = [property.neighborhood, property.city].filter(Boolean).join(", ");

  return (
    <Link
      href={{ pathname: "/projets/[slug]", params: { slug: translation.slug } }}
      className="group flex flex-col h-full bg-cream rounded-2xl overflow-hidden ring-1 ring-line card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] bg-navy-light overflow-hidden">
        {cover ? (
          <Image
            src={imageUrl(cover.id)}
            alt={translation.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-ivory/40">
            POLARIS Construction
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy/70 to-transparent" />
        <div className="absolute top-3 start-3 flex flex-wrap gap-2">
          <StatusBadge status={property.status} />
          {property.is_new && <NewBadge />}
        </div>
        {property.units_available != null && property.status !== "sold_out" && (
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-navy backdrop-blur">
            <BuildingIcon className="h-3.5 w-3.5" />
            {t("units", { count: property.units_available })}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {place && (
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-navy/50">
            <PinIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span className="truncate">{place}</span>
          </p>
        )}
        <h3 className="mt-2 font-display text-xl text-navy leading-snug">{translation.name}</h3>
        {translation.short_description && (
          <p className="mt-2 text-sm text-navy/65 leading-relaxed line-clamp-2">
            {translation.short_description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-navy/45">{t("priceLabel")}</p>
              <p className="font-semibold text-navy truncate">
                {property.show_price && property.price
                  ? formatPrice(property.price, property.price_currency, locale)
                  : t("priceOnRequest")}
              </p>
            </div>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-ivory transition-colors group-hover:bg-gold"
              aria-hidden="true"
            >
              <ArrowIcon />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
