import type { Currency, Product, Region } from "./types";

export const REGION_COOKIE = "md_region";
export const REGION_CURRENCY: Record<Region, Currency> = { US: "USD", EU: "EUR", IN: "INR" };
export const CURRENCY_SYMBOL: Record<Currency, string> = { USD: "$", EUR: "€", INR: "₹" };

export function regionFromCountry(code?: string | null): Region {
  const c = (code || "").toUpperCase();
  if (["US", "CA", "MX"].includes(c)) return "US";
  if (["GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "PT", "GR", "FI", "SE", "DK", "NO", "PL", "CH"].includes(c)) return "EU";
  return "IN";
}

export function getProductPrice(product: Product, currency: Currency) {
  if (currency === "USD") return product.priceUsd;
  if (currency === "EUR") return product.priceEur;
  return product.priceInr;
}

export function getDiscountedPrice(product: Product, currency: Currency) {
  const price = getProductPrice(product, currency);
  if (!product.discountPercent) return price;
  return Math.round(price * (1 - product.discountPercent / 100));
}

export function formatMoney(value: number, currency: Currency) {
  const locale = currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function productImageForColor(product: Product, color: string) {
  return product.colorImages.find((item) => item.color === color)?.image ?? product.image;
}
