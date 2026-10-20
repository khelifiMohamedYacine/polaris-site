export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatPrice(
  price: number,
  currency: string,
  locale: "fr" | "ar",
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    maximumFractionDigits: 0,
  }).format(price) + " " + currency;
}

export function generateInquiryReference(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `POL-${y}${m}${d}-${rand}`;
}

export function statusLabel(
  status: "available" | "few_left" | "sold_out",
  t: (key: string) => string,
): string {
  return t(`status.${status}`);
}
