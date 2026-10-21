import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale, PropertyWithRelations } from "@/types/database";
import { translationFor } from "@/lib/data";
import { imageUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { StatusBadge, NewBadge } from "./StatusBadge";
import { ArrowIcon, BuildingIcon, PinIcon, TagIcon } from "./icons";

/** Wide card for the lead project on the home page: photo on one side, details on a dark panel. */
export function PropertySpotlight({ property }: { property: PropertyWithRelations }) {
  const t = useTranslations("properties");
  const locale = useLocale() as Locale;
  const translation = translationFor(property, locale);
  const cover = property.property_images.find((img) => img.kind === "building");

  if (!translation) return null;

  const place = [property.neighborhood, property.city].filter(Boolean).join(", ");

  return (
    <Link
      href={{ pathname: "/projets/[slug]", params: { slug: translation.slug } }}
      className="group grid lg:grid-cols-5 rounded-3xl overflow-hidden bg-navy text-ivory card-shadow ring-1 ring-navy/10"
    >
      <div className="relative lg:col-span-3 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[28rem] bg-navy-light overflow-hidden">
        {cover ? (
          <Image
            src={imageUrl(cover.id)}
            alt={translation.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-2xl text-ivory/30">
            POLARIS Construction
          </div>
        )}
        <div className="absolute top-4 start-4 flex flex-wrap gap-2">
          <StatusBadge status={property.status} />
          {property.is_new && <NewBadge />}
        </div>
      </div>

      <div className="relative lg:col-span-2 flex flex-col p-7 sm:p-10">
        <div className="absolute inset-y-0 start-0 w-1 bg-gold hidden lg:block" />
        {place && (
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ivory/60">
            <PinIcon className="h-4 w-4 text-gold-light" />
            {place}
          </p>
        )}
        <h3 className="mt-3 font-display text-3xl md:text-4xl leading-tight">{translation.name}</h3>
        {translation.short_description && (
          <p className="mt-4 text-ivory/75 leading-relaxed line-clamp-4">{translation.short_description}</p>
        )}

        <dl className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
            <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ivory/50">
              <TagIcon className="h-3.5 w-3.5" />
              {t("priceLabel")}
            </dt>
            <dd className="mt-1 font-semibold">
              {property.show_price && property.price
                ? formatPrice(property.price, property.price_currency, locale)
                : t("priceOnRequest")}
            </dd>
          </div>
          {property.units_available != null && (
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ivory/50">
                <BuildingIcon className="h-3.5 w-3.5" />
                {t("unitsLabel")}
              </dt>
              <dd className="mt-1 font-semibold">{property.units_available}</dd>
            </div>
          )}
        </dl>

        <span className="btn-gold mt-8 lg:mt-auto self-start inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide">
          {t("viewProject")}
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
