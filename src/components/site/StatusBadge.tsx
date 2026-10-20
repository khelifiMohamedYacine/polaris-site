import { useTranslations } from "next-intl";
import type { PropertyStatus } from "@/types/database";

const STYLES: Record<PropertyStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  few_left: "bg-amber-50 text-amber-700 ring-amber-600/20",
  sold_out: "bg-stone-200 text-stone-600 ring-stone-500/20",
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const t = useTranslations("status");
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {t(status)}
    </span>
  );
}

export function NewBadge() {
  const t = useTranslations("status");
  return (
    <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">
      {t("new")}
    </span>
  );
}
