import type { ChartSeries } from "./charts";
import { formatDate } from "./format";
import { copy, describeActivities, fill, translateTerm, type Locale } from "./messages";
import type { Filters, Metrics, Submission } from "./types";

export const KPI_ITEMS: Array<{
  key: keyof Metrics;
  label: string;
  kind: "count" | "percent";
}> = [
  { key: "planned", label: "Shughuli zilizopangwa", kind: "count" },
  { key: "completed", label: "Shughuli zilizokamilika", kind: "count" },
  { key: "ongoing", label: "Shughuli zinazoendelea", kind: "count" },
  { key: "completionRatio", label: "Asilimia ya kukamilika", kind: "percent" },
  { key: "tested", label: "Waliopima VVU", kind: "count" },
  { key: "positive", label: "Waliokutwa na Maambukizi ya VVU", kind: "count" },
  { key: "educated", label: "Waliofikiwa na Elimu", kind: "count" },
  { key: "condoms", label: "Kondomu zilizogawanywa", kind: "count" },
  { key: "pep", label: "Dawa Kinga/PEP/PrEP zilizogawanywa", kind: "count" },
  { key: "selfTests", label: "Jipime/Self test kit zilizogawanywa", kind: "count" },
  { key: "positivity", label: "Asilimia ya maambukizi", kind: "percent" },
  { key: "linked", label: "Waliounganishwa na huduma", kind: "count" },
  { key: "linkageRatio", label: "Asilimia ya kuunganishwa", kind: "percent" },
];

export type ReportRow = {
  na: number;
  tarehe: string;
  kanda: string;
  mkoa: string;
  halmashauri: string;
  shughuli: string;
  aina: string;
  hali: string;
  eneo: string;
  mdau: string;
  vvuMe: number;
  vvuKe: number;
  vvuJumla: number;
  maambukiziMe: number;
  maambukiziKe: number;
  maambukiziJumla: number;
  waliounganishwa: number;
  elimu: number;
  kondomu: number;
  pep: number;
  jipime: number;
  ushahidi: string;
  sampuli: string;
};

export function toReportRows(rows: Submission[], locale: Locale = "sw"): ReportRow[] {
  const t = copy[locale];
  return rows.map((row, index) => ({
    na: index + 1,
    tarehe: row.tarehe,
    kanda: row.kanda,
    mkoa: row.mkoa,
    halmashauri: row.halmashauri,
    shughuli: row.shughuli,
    aina: describeActivities(locale, row.aina, row.nyingine),
    hali: translateTerm(locale, row.hali),
    eneo: row.eneo,
    mdau: row.mdau,
    vvuMe: row.vvuMe,
    vvuKe: row.vvuKe,
    vvuJumla: row.vvuMe + row.vvuKe,
    maambukiziMe: row.maambukiziMe,
    maambukiziKe: row.maambukiziKe,
    maambukiziJumla: row.maambukiziMe + row.maambukiziKe,
    waliounganishwa: row.waliounganishwa,
    elimu: row.elimu,
    kondomu: row.kondomu,
    pep: row.pep,
    jipime: row.jipime,
    ushahidi: row.ushahidi,
    sampuli: row.sample ? t.words.yes : "",
  }));
}

export function describeFilters(filters: Filters, locale: Locale = "sw"): string {
  const t = copy[locale];
  const parts: string[] = [];
  if (filters.kanda) parts.push(`${t.fields.zone} ${filters.kanda}`);
  if (filters.mkoa) parts.push(`${t.fields.region} ${filters.mkoa}`);
  if (filters.halmashauri) parts.push(`${t.fields.council} ${filters.halmashauri}`);
  if (filters.aina) parts.push(`${t.fields.activityType} ${translateTerm(locale, filters.aina)}`);
  if (filters.kuanzia) parts.push(`${t.export.from} ${formatDate(filters.kuanzia)}`);
  if (filters.hadi) parts.push(`${t.export.to} ${formatDate(filters.hadi)}`);
  return parts.length > 0 ? parts.join(" · ") : t.export.allReports;
}

export function fileStamp(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function placeChartTitle(series: ChartSeries, locale: Locale = "sw"): string {
  const t = copy[locale];
  const noun = t.places[series.placeGrain];
  const template = series.placeValue === "tested" ? t.charts.testedBy : t.charts.activitiesBy;
  return fill(template, { place: noun });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
