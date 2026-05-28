export function formatPrice(value: number | null, currency = "usd"): string {
  if (value == null) return "—";
  const digits = value < 1 ? 6 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value: number | null, currency?: string): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
    ...(currency
      ? { style: "currency", currency: currency.toUpperCase() }
      : {}),
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value == null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
