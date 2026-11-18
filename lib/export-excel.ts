import { formatPercent } from "./format";
import {
  KPI_ITEMS,
  describeFilters,
  downloadBlob,
  fileStamp,
  placeChartTitle,
  toReportRows,
} from "./export-report";
import type { ChartSeries } from "./charts";
import type { Filters, Metrics, Submission } from "./types";

type WorkbookModule = {
  utils: {
    book_new: () => unknown;
    aoa_to_sheet: (rows: unknown[][]) => unknown;
    book_append_sheet: (book: unknown, sheet: unknown, name: string) => void;
  };
  write: (book: unknown, options: { bookType: "xlsx"; type: "array" }) => ArrayBuffer;
};

function workbookApi(loaded: WorkbookModule & { default?: WorkbookModule }): WorkbookModule {
  return loaded.utils ? loaded : (loaded.default as WorkbookModule);
}

function metricValue(metrics: Metrics, key: keyof Metrics, kind: "count" | "percent"): string | number {
  const raw = Number(metrics[key]);
  return kind === "percent" ? formatPercent(raw) : raw;
}

export async function downloadExcel(input: {
  rows: Submission[];
  metrics: Metrics;
  charts: ChartSeries;
  filters: Filters;
}): Promise<void> {
  const loaded = (await import("xlsx")) as WorkbookModule & { default?: WorkbookModule };
  const XLSX = workbookApi(loaded);
  const scope = describeFilters(input.filters);
  const reportRows = toReportRows(input.rows);
  const book = XLSX.utils.book_new();

  const indicators: unknown[][] = [
    ["WAD 2026"],
    ["Dashibodi ya ufuatiliaji"],
    ["Kichujio", scope],
    ["Idadi ya taarifa", input.rows.length],
    [],
    ["Kiashiria", "Thamani"],
    ...KPI_ITEMS.map((item) => [item.label, metricValue(input.metrics, item.key, item.kind)]),
  ];

  const charts: unknown[][] = [
    ["Sehemu", "Kipengele", "Thamani", "Thamani ya pili"],
    ...input.charts.status.map((item) => ["Hali ya shughuli", item.label, item.count, ""]),
    ...input.charts.gender.map((item) => ["Upimaji na maambukizi kwa jinsia", item.label, item.me, item.ke]),
    ...input.charts.days.map((item) => [
      "Mwenendo wa upimaji na maambukizi",
      item.date || "Bila tarehe",
      item.tested,
      item.positive,
    ]),
    ...input.charts.places.map((item) => [
      placeChartTitle(input.charts),
      item.label,
      input.charts.placeValue === "tested" ? item.tested : item.activities,
      item.positive,
    ]),
    ...input.charts.activities.map((item) => ["Aina ya shughuli", item.label, item.count, ""]),
    ...input.charts.supplies.map((item) => ["Vifaa vilivyogawanywa", item.label, item.value, ""]),
  ];

  const totals = reportRows.reduce(
    (sum, row) => ({
      vvuMe: sum.vvuMe + row.vvuMe,
      vvuKe: sum.vvuKe + row.vvuKe,
      vvuJumla: sum.vvuJumla + row.vvuJumla,
      maambukiziMe: sum.maambukiziMe + row.maambukiziMe,
      maambukiziKe: sum.maambukiziKe + row.maambukiziKe,
      maambukiziJumla: sum.maambukiziJumla + row.maambukiziJumla,
      waliounganishwa: sum.waliounganishwa + row.waliounganishwa,
      elimu: sum.elimu + row.elimu,
      kondomu: sum.kondomu + row.kondomu,
      pep: sum.pep + row.pep,
      jipime: sum.jipime + row.jipime,
    }),
    {
      vvuMe: 0,
      vvuKe: 0,
      vvuJumla: 0,
      maambukiziMe: 0,
      maambukiziKe: 0,
      maambukiziJumla: 0,
      waliounganishwa: 0,
      elimu: 0,
      kondomu: 0,
      pep: 0,
      jipime: 0,
    },
  );

  const table: unknown[][] = [
    [
      "Na.",
      "Tarehe",
      "Kanda",
      "Mkoa",
      "Halmashauri",
      "Shughuli iliyopangwa",
      "Aina ya shughuli",
      "Hali ya utekelezaji",
      "Eneo / kundi lengwa",
      "Mhusika / mdau",
      "VVU Me",
      "VVU Ke",
      "VVU Jumla",
      "Maambukizi Me",
      "Maambukizi Ke",
      "Maambukizi Jumla",
      "Waliounganishwa",
      "Waliofikiwa elimu",
      "Kondomu",
      "PEP/PrEP",
      "Jipime",
      "Ushahidi / rejea",
      "Sampuli",
    ],
    ...reportRows.map((row) => [
      row.na,
      row.tarehe,
      row.kanda,
      row.mkoa,
      row.halmashauri,
      row.shughuli,
      row.aina,
      row.hali,
      row.eneo,
      row.mdau,
      row.vvuMe,
      row.vvuKe,
      row.vvuJumla,
      row.maambukiziMe,
      row.maambukiziKe,
      row.maambukiziJumla,
      row.waliounganishwa,
      row.elimu,
      row.kondomu,
      row.pep,
      row.jipime,
      row.ushahidi,
      row.sampuli,
    ]),
    [
      "",
      "",
      "",
      "",
      "",
      "Jumla",
      "",
      "",
      "",
      "",
      totals.vvuMe,
      totals.vvuKe,
      totals.vvuJumla,
      totals.maambukiziMe,
      totals.maambukiziKe,
      totals.maambukiziJumla,
      totals.waliounganishwa,
      totals.elimu,
      totals.kondomu,
      totals.pep,
      totals.jipime,
      "",
      "",
    ],
  ];

  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(indicators), "Viashiria");
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(charts), "Chati");
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(table), "Taarifa");

  const bytes = XLSX.write(book, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `wad-2026-${fileStamp()}.xlsx`,
  );
}
