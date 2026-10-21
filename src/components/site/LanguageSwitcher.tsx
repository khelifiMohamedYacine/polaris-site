"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const nextLocale = locale === "fr" ? "ar" : "fr";

  return (
    <button
      type="button"
      onClick={() =>
        router.replace(
          // @ts-expect-error -- dynamic pathname/params pair from current route
          { pathname, params },
          { locale: nextLocale },
        )
      }
      className={`inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-1.5 text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors cursor-pointer ${className}`}
      lang={nextLocale}
      aria-label="Changer de langue / تغيير اللغة"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
      </svg>
      {t("languageSwitch")}
    </button>
  );
}
