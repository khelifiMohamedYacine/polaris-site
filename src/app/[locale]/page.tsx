import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedProperties } from "@/lib/data";
import { PropertyCard } from "@/components/site/PropertyCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const properties = await getPublishedProperties();
  const featured = properties.slice(0, 6);

  return (
    <div>
      <section className="relative bg-navy text-ivory">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(224,52,15,0.22),_transparent_60%)]" />
        <div className="container-page relative py-28 md:py-36 text-center">
          <h1 className="font-display text-4xl md:text-6xl leading-tight max-w-3xl mx-auto">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-6 text-lg text-ivory/80 max-w-2xl mx-auto">
            {t("home.heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projets"
              className="btn-gold px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
            >
              {t("home.ctaProperties")}
            </Link>
            <Link
              href="/contact"
              className="btn-outline px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
            >
              {t("home.ctaContact")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Image
          src="/house_one.jpg"
          alt={t("home.bioImageAlt")}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="container-page relative flex items-center min-h-[34rem] md:min-h-[40rem] py-16 md:py-24">
          <div className="max-w-xl rounded-2xl bg-white/95 backdrop-blur-sm p-8 md:p-10 shadow-2xl">
            <p className="text-gold text-sm tracking-widest uppercase mb-3">
              {t("home.bioHeading")}
            </p>
            <h2 className="font-display text-3xl text-navy mb-5">
              {t("about.heading")}
            </h2>
            <p className="text-navy/70 leading-relaxed">{t("home.bioBody")}</p>
            <Link
              href="/a-propos"
              className="inline-block mt-6 text-sm font-medium text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              {t("home.bioLink")}
            </Link>
          </div>
        </div>
      </section>

      <section id="terrain" className="bg-navy text-ivory py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-gold text-sm tracking-widest uppercase mb-3">
              {t("land.eyebrow")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              {t("land.heading")}
            </h2>
            <p className="mt-4 text-ivory/75 leading-relaxed">{t("land.intro")}</p>
          </div>

          <div className="mt-12 grid lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-navy-light p-8 flex flex-col">
              <span className="font-display text-4xl text-gold">01</span>
              <h3 className="mt-4 font-display text-2xl">{t("land.houseTitle")}</h3>
              <p className="mt-3 text-ivory/75 leading-relaxed flex-1">
                {t("land.houseBody")}
              </p>
              <Link
                href="/contact"
                className="btn-outline mt-8 self-start px-7 py-3 rounded-full text-sm font-semibold tracking-wide"
              >
                {t("land.houseCta")}
              </Link>
            </div>

            <div className="rounded-2xl bg-navy-light p-8 flex flex-col ring-1 ring-gold/60">
              <span className="font-display text-4xl text-gold">02</span>
              <h3 className="mt-4 font-display text-2xl">{t("land.partnerTitle")}</h3>
              <p className="mt-3 text-ivory/75 leading-relaxed">
                {t("land.partnerBody")}
              </p>

              <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center text-xs">
                <span className="rounded-lg border border-white/15 px-2 py-3">{t("land.yourLand")}</span>
                <span className="text-gold text-lg" aria-hidden="true">+</span>
                <span className="rounded-lg border border-white/15 px-2 py-3">{t("land.ourBuild")}</span>
                <span className="text-gold text-lg" aria-hidden="true">=</span>
                <span className="rounded-lg bg-gold text-white font-semibold px-2 py-3">50 / 50</span>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-ivory/85 flex-1">
                {(["partnerPoint1", "partnerPoint2", "partnerPoint3"] as const).map((key) => (
                  <li key={key} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {t(`land.${key}`)}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="btn-gold mt-8 self-start px-7 py-3 rounded-full text-sm font-semibold tracking-wide"
              >
                {t("land.partnerCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <h2 className="font-display text-3xl text-navy">
              {t("home.featuredHeading")}
            </h2>
            <Link
              href="/projets"
              className="text-sm font-medium text-gold hover:underline"
            >
              {t("home.viewAll")}
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="text-navy/60">{t("home.noProperties")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
