import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const cities = Array.from(new Set(all.map((p) => p.city))).sort();

  const filtered = all.filter((p) => {
    if (city && p.city !== city) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-navy">{t("pageTitle")}</h1>
        <p className="mt-4 text-navy/70">{t("pageSubtitle")}</p>
      </div>

      <PropertyFilters cities={cities} />

      <p className="mt-8 mb-6 text-sm text-navy/60">
        {t("resultsCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="text-navy/60 py-12 text-center">{t("empty")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
