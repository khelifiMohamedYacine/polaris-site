import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getPropertyBySlug, getPublishedProperties, getSiteSettings, translationFor } from "@/lib/data";
import type { Locale } from "@/types/database";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { StatusBadge, NewBadge } from "@/components/site/StatusBadge";
import { InquiryForm } from "@/components/site/InquiryForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { PropertyCard } from "@/components/site/PropertyCard";
import { formatPrice } from "@/lib/format";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [property, t, settings] = await Promise.all([
    getPropertyBySlug(loc, slug),
    getTranslations("propertyDetail"),
    getSiteSettings(),
  ]);

  if (!property) notFound();

  const translation = translationFor(property, loc)!;
  if (translation.slug !== slug) {
    redirect({
      href: { pathname: "/projets/[slug]", params: { slug: translation.slug } },
      locale: loc,
    });
  }

  const similar = (await getPublishedProperties())
    .filter((p) => p.id !== property.id && p.status !== "sold_out")
    .slice(0, 3);

  const whatsappMessage = t("whatsappMessage", { name: translation.name });

  return (
    <div className="container-page py-12 md:py-16">
      <Link href="/projets" className="text-sm text-navy/60 hover:text-gold">
        {t("backToList")}
      </Link>

      <div className="mt-6 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge status={property.status} />
            {property.is_new && <NewBadge />}
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-navy">
            {translation.name}
          </h1>
          <p className="mt-2 text-navy/60">
            {[property.neighborhood, property.city].filter(Boolean).join(", ")}
          </p>

          <div className="mt-6">
            <PropertyGallery
              images={property.property_images}
              alt={translation.name}
              labels={{ interior: t("galleryInterior"), building: t("galleryBuilding") }}
            />
          </div>

          {translation.description && (
            <div className="mt-10">
              <h2 className="font-display text-xl text-navy mb-3">
                {t("descriptionHeading")}
              </h2>
              <p className="text-navy/70 leading-relaxed whitespace-pre-line">
                {translation.description}
              </p>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-xl text-navy mb-3">
              {t("detailsHeading")}
            </h2>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              {property.units_available != null && (
                <div className="rounded-lg bg-white ring-1 ring-line p-4">
                  <dt className="text-navy/50">{t("unitsAvailable")}</dt>
                  <dd className="mt-1 font-medium text-navy">
                    {property.units_available}
                  </dd>
                </div>
              )}
              <div className="rounded-lg bg-white ring-1 ring-line p-4">
                <dt className="text-navy/50">{t("location")}</dt>
                <dd className="mt-1 font-medium text-navy">
                  {property.address || `${property.neighborhood ?? ""} ${property.city}`.trim()}
                </dd>
              </div>
              <div className="rounded-lg bg-white ring-1 ring-line p-4">
                <dt className="text-navy/50">{t("priceHeading")}</dt>
                <dd className="mt-1 font-medium text-navy">
                  {property.show_price && property.price
                    ? formatPrice(property.price, property.price_currency, loc)
                    : t("priceOnRequest")}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-2xl card-shadow p-6">
            {property.status === "sold_out" && (
              <p className="mb-4 text-sm text-navy/60 bg-navy/5 rounded-lg p-3">
                {t("soldOutNotice")}
              </p>
            )}
            <h2 className="font-display text-xl text-navy mb-2">
              {t("enquiryHeading")}
            </h2>
            <p className="text-sm text-navy/60 mb-5">{t("enquiryIntro")}</p>
            <InquiryForm propertyId={property.id} />

            {settings?.whatsapp_number && (
              <div className="mt-4">
                <WhatsAppButton
                  phoneNumber={settings.whatsapp_number}
                  message={whatsappMessage}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-navy mb-6">
            {t("similarHeading")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
