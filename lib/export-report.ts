import { formatDate } from "./format";
import type { ChartSeries } from "./charts";
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
];

const PLACE_NOUN = {
  kanda: "kanda",
  mkoa: "mkoa",
  halmashauri: "halmashauri",
} as const;

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

export function toReportRows(rows: Submission[]): ReportRow[] {
  return rows.map((row, index) => ({
    na: index + 1,
    tarehe: row.tarehe,
    kanda: row.kanda,
    mkoa: row.mkoa,
    halmashauri: row.halmashauri,
    shughuli: row.shughuli,
    aina: row.aina,
    hali: row.hali,
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
    sampuli: row.sample ? "Ndiyo" : "",
  }));
}

export function describeFilters(filters: Filters): string {
  const parts: string[] = [];
  if (filters.kanda) parts.push(`Kanda ${filters.kanda}`);
  if (filters.mkoa) parts.push(`Mkoa ${filters.mkoa}`);
  if (filters.halmashauri) parts.push(`Halmashauri ${filters.halmashauri}`);
  if (filters.aina) parts.push(`Aina ${filters.aina}`);
  if (filters.kuanzia) parts.push(`Kuanzia ${formatDate(filters.kuanzia)}`);
  if (filters.hadi) parts.push(`Hadi ${formatDate(filters.hadi)}`);
  return parts.length > 0 ? parts.join(" · ") : "Taarifa zote";
}

export function fileStamp(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function placeChartTitle(series: ChartSeries): string {
  const noun = PLACE_NOUN[series.placeGrain];
  return series.placeValue === "tested" ? `Waliopima kwa ${noun}` : `Shughuli kwa ${noun}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
