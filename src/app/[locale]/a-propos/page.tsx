import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");

  const values = [
    { title: t("value1Title"), body: t("value1Body") },
    { title: t("value2Title"), body: t("value2Body") },
    { title: t("value3Title"), body: t("value3Body") },
  ];

  return (
    <div>
      {/* Hero: full-bleed photo with dark gradient for legibility */}
      <section className="relative overflow-hidden text-ivory">
        <Image
          src="/toppic.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_65%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" />
        <div className="container-page relative flex flex-col justify-end min-h-[30rem] md:min-h-[38rem] pt-32 pb-14 md:pb-20">
          <p className="text-gold-light text-sm font-semibold tracking-widest uppercase mb-3">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-4xl md:text-6xl max-w-3xl leading-tight">
            {t("pageTitle")}
          </h1>
        </div>
      </section>

      {/* Story: façade photo beside the text, then the closing line as a highlight */}
      <section className="container-page py-16 md:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative aspect-[3/2] w-full max-w-xl mx-auto lg:max-w-none rounded-2xl overflow-hidden card-shadow">
          <Image
            src="/polaris-construction.jpg"
            alt="POLARIS Construction"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl text-navy mb-6">{t("heading")}</h2>
          <div className="space-y-4 text-navy/75 leading-relaxed">
            <p>{t("bodyP1")}</p>
            <p>{t("bodyP2")}</p>
            <p>{t("bodyP3")}</p>
          </div>
          <blockquote className="mt-8 border-s-4 border-gold ps-5 font-display text-xl text-navy">
            {t("bodyP4")}
          </blockquote>
        </div>
      </section>

      {/* Values: translucent dark cards over the photo, running straight into the footer */}
      <section className="relative overflow-hidden text-ivory">
        <Image
          src="/construction-site.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
        {/* object-bottom: when the photo is cropped, the sky at the top goes, never the building. */}
        <div className="absolute inset-0 bg-navy/70" />
        <div className="container-page relative flex flex-col justify-center min-h-[40rem] md:min-h-[48rem] py-24 md:py-32">
          <h2 className="font-display text-3xl md:text-4xl mb-12 text-center">
            {t("valuesHeading")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="rounded-2xl bg-navy/55 backdrop-blur-[2px] ring-1 ring-white/10 p-8"
              >
                <span className="font-display text-4xl text-gold">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl mb-2">{value.title}</h3>
                <p className="text-sm text-ivory/80 leading-relaxed">{value.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="btn-gold inline-block px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
            >
              {tNav("contact")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
