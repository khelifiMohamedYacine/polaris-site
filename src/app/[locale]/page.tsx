import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedProperties } from "@/lib/data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertySpotlight } from "@/components/site/PropertySpotlight";
import { ArrowIcon } from "@/components/site/icons";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const properties = await getPublishedProperties();
  // The newest project gets the wide spotlight and the rest fill one full row of cards.
  // With exactly two projects, both are spotlights so a single card never sits alone.
  const featured = properties.slice(0, 4);
  const spotlights = featured.length === 2 ? featured : featured.slice(0, 1);
  const cards = featured.slice(spotlights.length);
  const cityCount = new Set(properties.map((p) => p.city).filter(Boolean)).size;

  return (
    <div>
      <section className="relative overflow-hidden bg-navy text-ivory">
        <Image
          src="/FirstPic.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Darkens the photo so the text reads, then fades fully to dark at the bottom into the next section. */}
        <div className="absolute inset-0 bg-navy/55" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent via-navy/60 to-navy" />
        <div className="container-page relative pt-44 pb-28 md:pt-52 md:pb-36 text-center">
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

      <section className="bg-navy text-ivory py-16 md:py-24">
        <div className="container-page grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/5] max-h-[36rem] w-full rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
            <Image
              src="/residence-facade.jpeg"
              alt={t("home.bioImageAlt")}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="max-w-xl">
            <p className="text-gold-light text-sm font-semibold tracking-widest uppercase mb-3">
              {t("home.bioHeading")}
            </p>
            <h2 className="font-display text-3xl text-ivory mb-5">
              {t("about.heading")}
            </h2>
            <p className="text-ivory/85 leading-relaxed">{t("home.bioBody")}</p>
            <Link
              href="/a-propos"
              className="inline-block mt-6 text-sm font-medium text-ivory border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              {t("home.bioLink")}
            </Link>
          </div>
        </div>
      </section>

      <section id="terrain" className="relative overflow-hidden bg-navy text-ivory py-20 md:py-28">
        <Image
          src="/house_one.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark layer so the text and cards stay readable, fading from the solid section above. */}
        <div className="absolute inset-0 bg-navy/75" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy to-transparent" />
        <div className="container-page relative">
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
            <div className="rounded-2xl bg-navy/55 backdrop-blur-[2px] ring-1 ring-white/10 p-8 flex flex-col">
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

            <div className="rounded-2xl bg-navy/55 backdrop-blur-[2px] p-8 flex flex-col ring-1 ring-gold/60">
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

      <section className="relative overflow-hidden bg-ivory py-20 md:py-28">
        {/* Soft brand-red glows so the light section isn't a flat white block */}
        <div className="pointer-events-none absolute -top-40 -end-40 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl" />

        <div className="container-page relative">
          <div className="grid lg:grid-cols-2 gap-10 items-end mb-12">
            <div>
              <p className="flex items-center gap-3 text-gold text-sm font-semibold tracking-widest uppercase">
                <span className="h-px w-10 bg-gold" />
                {t("home.featuredEyebrow")}
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-navy leading-tight">
                {t("home.featuredHeading")}
              </h2>
              <p className="mt-4 text-navy/65 leading-relaxed max-w-lg">{t("home.featuredSubtitle")}</p>
            </div>

            <dl className="grid grid-cols-3 gap-3">
              {[
                { value: "2015", label: t("home.statsFounded") },
                { value: String(properties.length), label: t("home.statsProjects") },
                { value: String(cityCount), label: t("home.statsCities") },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse rounded-2xl bg-white ring-1 ring-line p-4 sm:p-5 text-center">
                  <dt className="mt-1 text-[11px] sm:text-xs uppercase tracking-wider text-navy/50">{stat.label}</dt>
                  <dd className="font-display text-2xl sm:text-3xl text-navy">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-3xl bg-white ring-1 ring-line p-10 md:p-14 text-center">
              <p className="font-display text-2xl text-navy">{t("home.noProperties")}</p>
              <Link
                href="/contact"
                className="btn-gold inline-block mt-6 px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
              >
                {t("home.ctaContact")}
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {spotlights.map((property) => (
                  <PropertySpotlight key={property.id} property={property} />
                ))}
              </div>
              {cards.length > 0 && (
                <div
                  className={`mt-8 grid sm:grid-cols-2 gap-6 lg:gap-8 ${cards.length === 3 ? "lg:grid-cols-3" : ""}`}
                >
                  {cards.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/projets"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-semibold tracking-wide text-ivory transition-colors hover:bg-gold"
            >
              {t("home.viewAll")}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
