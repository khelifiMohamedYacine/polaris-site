import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getPropertyBySlug, getPublishedProperties, getSiteSettings, translationFor } from "@/lib/data";
import type { Locale } from "@/types/database";
import { imageUrl } from "@/lib/storage";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { StatusBadge, NewBadge } from "@/components/site/StatusBadge";
import { InquiryForm } from "@/components/site/InquiryForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { PropertyCard } from "@/components/site/PropertyCard";
import { ArrowIcon, BuildingIcon, CheckCircleIcon, PhoneIcon, PinIcon, TagIcon } from "@/components/site/icons";
import { formatPrice } from "@/lib/format";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [property, t, tStatus, settings] = await Promise.all([
    getPropertyBySlug(loc, slug),
    getTranslations("propertyDetail"),
    getTranslations("status"),
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
  const cover = property.property_images.find((img) => img.kind === "building");
  const place = [property.neighborhood, property.city].filter(Boolean).join(", ");
  const price =
    property.show_price && property.price
      ? formatPrice(property.price, property.price_currency, loc)
      : t("priceOnRequest");
  const phoneDigits = settings.company_phone?.replace(/[^0-9+]/g, "");
  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const facts = [
    { icon: TagIcon, label: t("priceHeading"), value: price },
    ...(property.units_available != null
      ? [{ icon: BuildingIcon, label: t("unitsAvailable"), value: String(property.units_available) }]
      : []),
    { icon: PinIcon, label: t("location"), value: property.address || place },
    { icon: CheckCircleIcon, label: t("statusLabel"), value: tStatus(property.status) },
  ];

  return (
    <div className="pb-20 md:pb-28">
      {/* Header: the building cover, heavily darkened, behind the name and location */}
      <section className="relative overflow-hidden bg-navy text-ivory">
        {cover && (
          <Image
            src={imageUrl(cover.id)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/80 to-navy" />
        <div className="container-page relative pt-32 pb-28 md:pt-36 md:pb-36">
          <Link
            href="/projets"
            className="inline-flex items-center gap-2 text-sm text-ivory/70 hover:text-gold-light transition-colors"
          >
            <ArrowIcon back />
            {t("backToListShort")}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <StatusBadge status={property.status} />
            {property.is_new && <NewBadge />}
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl">
            {translation.name}
          </h1>
          {place && (
            <p className="mt-3 flex items-center gap-2 text-ivory/70">
              <PinIcon className="h-4 w-4 text-gold-light shrink-0" />
              {place}
            </p>
          )}
        </div>
      </section>

      <div className="container-page relative -mt-20 md:-mt-28 grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-2 min-w-0">
          <div className="rounded-2xl bg-white p-2 sm:p-3 card-shadow ring-1 ring-line">
            <PropertyGallery
              images={property.property_images}
              alt={translation.name}
              labels={{
                interior: t("galleryInterior"),
                building: t("galleryBuilding"),
                previous: t("previousPhoto"),
                next: t("nextPhoto"),
              }}
            />
          </div>

          <dl className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white ring-1 ring-line p-4 sm:p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <dt className="mt-3 text-xs uppercase tracking-wider text-navy/50">{label}</dt>
                <dd className="mt-1 font-semibold text-navy break-words">{value}</dd>
              </div>
            ))}
          </dl>

          {(translation.description || translation.short_description) && (
            <div className="mt-6 rounded-2xl bg-white ring-1 ring-line p-6 md:p-8">
              <h2 className="font-display text-2xl text-navy">{t("descriptionHeading")}</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-gold" />
              <p className="mt-5 text-navy/75 leading-relaxed whitespace-pre-line">
                {translation.description || translation.short_description}
              </p>
            </div>
          )}
        </div>

        <aside id="contact" className="lg:col-span-1 scroll-mt-28 lg:sticky lg:top-28">
          <div className="rounded-2xl bg-white card-shadow ring-1 ring-line overflow-hidden">
            <div className="bg-navy text-ivory p-6">
              <p className="text-xs uppercase tracking-wider text-ivory/50">{t("priceHeading")}</p>
              <p className="mt-1 font-display text-2xl">{price}</p>
            </div>
            <div className="p-6">
              {property.status === "sold_out" && (
                <p className="mb-5 text-sm text-navy/70 bg-navy/5 rounded-lg p-3">{t("soldOutNotice")}</p>
              )}
              <h2 className="font-display text-xl text-navy">{t("enquiryHeading")}</h2>
              <p className="mt-1 mb-5 text-sm text-navy/60">{t("enquiryIntro")}</p>
              <InquiryForm propertyId={property.id} />

              {(settings.whatsapp_number || phoneDigits) && (
                <div className="mt-5 pt-5 border-t border-line space-y-3">
                  {settings.whatsapp_number && (
                    <WhatsAppButton phoneNumber={settings.whatsapp_number} message={whatsappMessage} />
                  )}
                  {phoneDigits && (
                    <a
                      href={`tel:${phoneDigits}`}
                      className="flex items-center justify-center gap-2 w-full rounded-full border border-line px-6 py-3 text-sm font-semibold text-navy hover:border-navy transition-colors"
                    >
                      <PhoneIcon />
                      <span dir="ltr">{settings.company_phone}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="container-page mt-20">
          <h2 className="font-display text-2xl md:text-3xl text-navy">{t("similarHeading")}</h2>
          <div className="mt-2 mb-8 h-1 w-12 rounded-full bg-gold" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* Phones: contact actions always within thumb reach. globals.css pads the page so the bar never hides the footer. */}
      <div
        data-mobile-bar
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-line bg-white/95 backdrop-blur px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="btn-gold flex-1 rounded-full px-5 py-3 text-center text-sm font-semibold tracking-wide"
          >
            {t("contactCta")}
          </a>
          {phoneDigits && (
            <a
              href={`tel:${phoneDigits}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-navy"
              aria-label={t("callButton")}
            >
              <PhoneIcon className="h-5 w-5" />
            </a>
          )}
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
              aria-label={t("whatsappButton")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.26 4.9L2 22l5.25-1.37a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-10-10.01-10Zm4.52 12.01c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28Z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
