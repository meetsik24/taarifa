import type { ChartSeries } from "./charts";
import {
  KPI_ITEMS,
  describeFilters,
  downloadBlob,
  fileStamp,
  placeChartTitle,
  toReportRows,
} from "./export-report";
import { formatPercent } from "./format";
import { copy, translateTerm, type Locale } from "./messages";
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
  locale?: Locale;
}): Promise<void> {
  const locale = input.locale ?? "sw";
  const t = copy[locale];
  const loaded = (await import("xlsx")) as WorkbookModule & { default?: WorkbookModule };
  const XLSX = workbookApi(loaded);
  const scope = describeFilters(input.filters, locale);
  const reportRows = toReportRows(input.rows, locale);
  const book = XLSX.utils.book_new();

  const indicators: unknown[][] = [
    ["WAD 2026"],
    [t.export.dashboard],
    [t.export.filter, scope],
    [t.export.rowCount, input.rows.length],
    [],
    [t.export.indicator, t.export.value],
    ...KPI_ITEMS.map((item) => [
      t.kpis[item.key as Exclude<keyof typeof t.kpis, "title" | "subtitle">],
      metricValue(input.metrics, item.key, item.kind),
    ]),
  ];

  const charts: unknown[][] = [
    [t.export.section, t.export.item, t.export.value, t.export.secondValue],
    ...input.charts.status.map((item) => [t.charts.statusTitle, translateTerm(locale, item.label), item.count, ""]),
    ...input.charts.gender.map((item) => [
      t.charts.genderTitle,
      translateTerm(locale, item.label),
      item.me,
      item.ke,
    ]),
    ...input.charts.days.map((item) => [
      t.charts.trendTitle,
      item.date || t.charts.undated,
      item.tested,
      item.positive,
    ]),
    ...input.charts.places.map((item) => [
      placeChartTitle(input.charts, locale),
      translateTerm(locale, item.label),
      input.charts.placeValue === "tested" ? item.tested : item.activities,
      item.positive,
    ]),
    ...input.charts.activities.map((item) => [
      t.charts.activityTitle,
      translateTerm(locale, item.label),
      item.count,
      "",
    ]),
    ...input.charts.supplies.map((item) => [
      t.charts.suppliesTitle,
      translateTerm(locale, item.label),
      item.value,
      "",
    ]),
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
      t.words.number,
      t.fields.date,
      t.fields.zone,
      t.fields.region,
      t.fields.council,
      t.fields.activity,
      t.fields.activityType,
      t.fields.status,
      t.fields.area,
      t.fields.actor,
      t.export.testedMale,
      t.export.testedFemale,
      t.export.testedTotal,
      t.export.positiveMale,
      t.export.positiveFemale,
      t.export.positiveTotal,
      t.fields.linked,
      t.fields.educated,
      t.table.condoms,
      "PEP/PrEP",
      t.export.selfTest,
      t.fields.evidence,
      t.export.sample,
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
      t.words.total,
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

  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(indicators), t.export.sheetIndicators);
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(charts), t.export.sheetCharts);
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(table), t.export.sheetReports);

  const bytes = XLSX.write(book, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `wad-2026-${fileStamp()}.xlsx`,
  );
}
