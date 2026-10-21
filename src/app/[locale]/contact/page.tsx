import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/data";
import { InquiryForm } from "@/components/site/InquiryForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const settings = await getSiteSettings();

  return (
    <div>
      <section className="bg-navy text-ivory pt-40 pb-20 md:pt-48 md:pb-28">
        <div className="container-page">
          <h1 className="font-display text-4xl md:text-5xl">{t("pageTitle")}</h1>
          <p className="mt-4 text-ivory/75 max-w-xl">{t("pageSubtitle")}</p>
        </div>
      </section>

      <section className="container-page py-16 md:py-24 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display text-xl text-navy">{t("infoHeading")}</h2>
          <ul className="space-y-4 text-navy/75">
            {settings?.company_phone && (
              <li>
                <p className="text-xs uppercase tracking-wide text-navy/45">{t("phone")}</p>
                <p className="mt-1">{settings.company_phone}</p>
              </li>
            )}
            {settings?.company_email && (
              <li>
                <p className="text-xs uppercase tracking-wide text-navy/45">{t("email")}</p>
                <p className="mt-1">{settings.company_email}</p>
              </li>
            )}
            {settings?.company_address && (
              <li>
                <p className="text-xs uppercase tracking-wide text-navy/45">{t("address")}</p>
                <p className="mt-1">{settings.company_address}</p>
              </li>
            )}
          </ul>

          {settings?.whatsapp_number && (
            <WhatsAppButton
              phoneNumber={settings.whatsapp_number}
              message={t("whatsappMessage")}
            />
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl card-shadow p-6 md:p-8">
          <h2 className="font-display text-xl text-navy mb-5">
            {t("formHeading")}
          </h2>
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
