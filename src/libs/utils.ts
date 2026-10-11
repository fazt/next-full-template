import { siteConfig } from "@/config/site";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const currency = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
});
const dateFormat = new Intl.DateTimeFormat(siteConfig.locale, { dateStyle: "medium" });

export function formatPrice(value: number | string | { toString(): string }) {
  return currency.format(Number(value));
}

export function formatDate(value: Date | string) {
  return dateFormat.format(new Date(value));
}

export function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}
