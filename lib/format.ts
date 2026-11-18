const countFormat = new Intl.NumberFormat("sw-TZ");

export function formatCount(value: number): string {
  return countFormat.format(value);
}

export function formatPercent(ratio: number): string {
  const pct = Math.round(ratio * 1000) / 10;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}
