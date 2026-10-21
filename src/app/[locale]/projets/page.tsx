import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedProperties } from "@/lib/data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyFilters } from "@/components/site/PropertyFilters";

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { city, status } = await searchParams;
  const t = await getTranslations("properties");

  const all = await getPublishedProperties();
  const cities = Array.from(new Set(all.map((p) => p.city).filter(Boolean))).sort();

  const filtered = all.filter((p) => {
    if (city && p.city !== city) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-navy text-ivory">
        <Image
          src="/latimer-lumina-external-1.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/75 to-navy/40" />
        {/* Same height as the À propos banner; extra bottom padding leaves room for the overlapping filter bar. */}
        <div className="container-page relative flex flex-col justify-end min-h-[30rem] md:min-h-[38rem] pt-32 pb-20 md:pb-24">
          <p className="flex items-center gap-3 text-gold-light text-sm font-semibold tracking-widest uppercase">
            <span className="h-px w-10 bg-gold-light" />
            {t("heroEyebrow")}
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-tight">{t("pageTitle")}</h1>
          <p className="mt-4 text-ivory/75 max-w-xl leading-relaxed">{t("pageSubtitle")}</p>
        </div>
      </section>

      {/* Filter bar overlapping the banner */}
      <div className="container-page relative -mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-cream p-4 sm:p-5 card-shadow ring-1 ring-line">
          <PropertyFilters cities={cities} />
          <p className="text-sm text-navy/60 sm:text-end">{t("resultsCount", { count: filtered.length })}</p>
        </div>
      </div>

      <div className="container-page pt-12 pb-20 md:pt-16 md:pb-28">
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-cream ring-1 ring-line p-10 md:p-14 text-center">
            <p className="font-display text-xl text-navy">{t("empty")}</p>
            <Link
              href="/contact"
              className="btn-gold inline-block mt-6 px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
            >
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
