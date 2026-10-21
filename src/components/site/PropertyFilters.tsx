"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

const STATUSES = ["available", "few_left", "sold_out"] as const;

export function PropertyFilters({ cities }: { cities: string[] }) {
  const t = useTranslations("properties");
  const tStatus = useTranslations("status");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}` as never);
  }

  const selectClass =
    "w-full sm:w-auto rounded-full border border-line bg-sand px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/50 cursor-pointer";

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <select
        className={selectClass}
        defaultValue={searchParams.get("city") ?? ""}
        onChange={(e) => updateParam("city", e.target.value)}
        aria-label={t("filterCity")}
      >
        <option value="">{t("filterCity")} — {t("filterAll")}</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        aria-label={t("filterStatus")}
      >
        <option value="">{t("filterStatus")} — {t("filterAll")}</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {tStatus(status)}
          </option>
        ))}
      </select>
    </div>
  );
}
