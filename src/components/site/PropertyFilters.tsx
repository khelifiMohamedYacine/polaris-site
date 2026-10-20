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
    "rounded-full border border-line bg-white px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <div className="mt-8 flex flex-wrap gap-3">
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
