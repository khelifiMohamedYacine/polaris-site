import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/lib/data";

export async function Footer() {
  const t = await getTranslations();
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-ivory">
      <div className="container-page py-14">
        <div>
          <p className="font-display text-xl">
            POLARIS <span className="text-gold">Construction</span>
          </p>
          <p className="mt-3 text-sm text-ivory/70 max-w-xs">
            {t("footer.tagline")}
          </p>
        </div>

        {/* Contact on the start side, navigation on the end side — one row on every screen size */}
        <div className="mt-10 flex justify-between gap-8">
          <div className="min-w-0">
            <p className="text-gold text-sm tracking-wide uppercase mb-3">
              {t("footer.contactHeading")}
            </p>
            <ul className="space-y-2 text-sm text-ivory/80">
              {settings.company_phone && (
                <li>
                  <a href={`tel:${settings.company_phone.replace(/\s/g, "")}`} className="hover:text-gold" dir="ltr">
                    {settings.company_phone}
                  </a>
                </li>
              )}
              {settings.company_email && (
                <li className="break-all">
                  <a href={`mailto:${settings.company_email}`} className="hover:text-gold">
                    {settings.company_email}
                  </a>
                </li>
              )}
              {settings.company_address && <li>{settings.company_address}</li>}
            </ul>
          </div>

          <div className="text-end shrink-0">
            <p className="text-gold text-sm tracking-wide uppercase mb-3">
              {t("footer.linksHeading")}
            </p>
            <ul className="space-y-2 text-sm text-ivory/80">
              <li><Link href="/" className="hover:text-gold">{t("nav.home")}</Link></li>
              <li><Link href="/projets" className="hover:text-gold">{t("nav.properties")}</Link></li>
              <li><Link href="/a-propos" className="hover:text-gold">{t("nav.about")}</Link></li>
              <li><Link href="/contact" className="hover:text-gold">{t("nav.contact")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="container-page text-xs text-ivory/60">
          {t("footer.rights", { year })}
        </p>
      </div>
    </footer>
  );
}
