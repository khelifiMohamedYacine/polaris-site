import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { title: t("value1Title"), body: t("value1Body") },
    { title: t("value2Title"), body: t("value2Body") },
    { title: t("value3Title"), body: t("value3Body") },
  ];

  return (
    <div>
      <section className="bg-navy text-ivory py-20 md:py-28">
        <div className="container-page">
          <h1 className="font-display text-4xl md:text-5xl">{t("pageTitle")}</h1>
        </div>
      </section>

      <section className="container-page py-16 md:py-24 max-w-3xl">
        <h2 className="font-display text-2xl text-navy mb-6">{t("heading")}</h2>
        <div className="space-y-5 text-navy/75 leading-relaxed text-lg">
          <p>{t("bodyP1")}</p>
          <p>{t("bodyP2")}</p>
          <p>{t("bodyP3")}</p>
          <p>{t("bodyP4")}</p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container-page">
          <h2 className="font-display text-2xl text-navy mb-10 text-center">
            {t("valuesHeading")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center rounded-2xl ring-1 ring-line p-8"
              >
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gold/15 flex items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                </div>
                <h3 className="font-display text-lg text-navy mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-navy/65">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
