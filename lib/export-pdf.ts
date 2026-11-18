import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatCount, formatDate, formatPercent } from "./format";
import {
  KPI_ITEMS,
  describeFilters,
  fileStamp,
  placeChartTitle,
  toReportRows,
} from "./export-report";
import type { ChartSeries } from "./charts";
import type { Filters, Metrics, Submission } from "./types";

type RGB = [number, number, number];

const INK: RGB = [20, 34, 28];
const MUTED: RGB = [82, 100, 92];
const TESTED: RGB = [13, 92, 77];
const TESTED_SOFT: RGB = [61, 122, 104];
const POSITIVE: RGB = [141, 43, 43];
const SOFT: RGB = [231, 243, 238];
const LINE: RGB = [211, 223, 216];
const WHITE: RGB = [255, 255, 255];

const STATUS_COLOR: Record<string, RGB> = {
  Imekamilika: TESTED,
  Inaendelea: TESTED_SOFT,
  Haijaanza: MUTED,
  Imesitishwa: POSITIVE,
};

const PAGE = { w: 420, h: 297, margin: 12 };

function fill(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function draw(doc: jsPDF, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function textColor(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

type Bar = { label: string; value: number; color?: RGB };

function drawBars(doc: jsPDF, x: number, y: number, w: number, h: number, title: string, rows: Bar[]) {
  draw(doc, LINE);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  textColor(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 4, y + 6.5);

  const items = rows.length > 0 ? rows : [{ label: "Hakuna taarifa", value: 0 }];
  const max = Math.max(...items.map((item) => item.value), 1);
  const top = y + 11;
  const rowH = (h - 15) / items.length;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  items.forEach((item, index) => {
    const rowY = top + index * rowH;
    textColor(doc, MUTED);
    doc.text(clip(item.label, 24), x + 4, rowY + 3.2);
    const barX = x + 46;
    const barW = w - 64;
    const barH = Math.max(2.2, Math.min(3.6, rowH - 1.4));
    fill(doc, SOFT);
    doc.rect(barX, rowY, barW, barH, "F");
    fill(doc, item.color ?? TESTED);
    doc.rect(barX, rowY, barW * (item.value / max), barH, "F");
    textColor(doc, INK);
    doc.text(formatCount(item.value), x + w - 4, rowY + 3.2, { align: "right" });
  });
}

function drawGrouped(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  rows: Array<{ label: string; me: number; ke: number }>,
) {
  draw(doc, LINE);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  textColor(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  textColor(doc, TESTED);
  doc.text("Me", x + w - 28, y + 6.5);
  textColor(doc, INK);
  doc.text("Ke", x + w - 14, y + 6.5);

  const max = Math.max(...rows.flatMap((row) => [row.me, row.ke]), 1);
  const top = y + 12;
  const rowH = (h - 16) / Math.max(rows.length, 1);
  rows.forEach((row, index) => {
    const rowY = top + index * rowH;
    textColor(doc, MUTED);
    doc.text(row.label, x + 4, rowY + 4);
    const barX = x + 36;
    const barW = w - 54;
    fill(doc, SOFT);
    doc.rect(barX, rowY, barW, 3, "F");
    doc.rect(barX, rowY + 4, barW, 3, "F");
    fill(doc, TESTED);
    doc.rect(barX, rowY, barW * (row.me / max), 3, "F");
    fill(doc, INK);
    doc.rect(barX, rowY + 4, barW * (row.ke / max), 3, "F");
    textColor(doc, INK);
    doc.text(`${formatCount(row.me)} / ${formatCount(row.ke)}`, x + w - 4, rowY + 4, { align: "right" });
  });
}

function drawTrend(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  days: ChartSeries["days"],
) {
  draw(doc, LINE);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  textColor(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Mwenendo wa upimaji na maambukizi", x + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  textColor(doc, TESTED);
  doc.text("Waliopima", x + w - 42, y + 6.5);
  textColor(doc, POSITIVE);
  doc.text("Maambukizi", x + w - 4, y + 6.5, { align: "right" });

  const plotX = x + 8;
  const plotW = w - 16;
  const base = y + h - 12;
  const plotH = h - 22;
  const max = Math.max(...days.map((day) => day.tested), 1);
  const slot = plotW / Math.max(days.length, 1);
  days.forEach((day, index) => {
    const barW = Math.max(1.2, slot * 0.28);
    const left = plotX + index * slot + slot * 0.18;
    const testedH = plotH * (day.tested / max);
    const positiveH = plotH * (day.positive / max);
    fill(doc, TESTED);
    doc.rect(left, base - testedH, barW, testedH, "F");
    fill(doc, POSITIVE);
    doc.rect(left + barW + 0.4, base - positiveH, barW, positiveH, "F");
    if (days.length <= 16) {
      textColor(doc, MUTED);
      doc.setFontSize(6);
      doc.text(day.date ? formatDate(day.date).slice(0, 5) : "—", left, base + 4, { angle: 40 });
    }
  });
  if (days.length > 16) {
    textColor(doc, MUTED);
    doc.setFontSize(7);
    doc.text(`${formatDate(days[0]?.date ?? "")} – ${formatDate(days[days.length - 1]?.date ?? "")}`, x + 4, y + h - 4);
  }
}

function drawKpis(doc: jsPDF, metrics: Metrics, x: number, y: number, width: number) {
  const gap = 3;
  const cardW = (width - gap * 2) / 3;
  const cardH = 20;
  KPI_ITEMS.forEach((item, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const cardX = x + column * (cardW + gap);
    const cardY = y + row * (cardH + gap);
    draw(doc, LINE);
    fill(doc, WHITE);
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "FD");
    textColor(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(item.label, cardW - 8) as string[];
    doc.text(lines.slice(0, 2), cardX + 3, cardY + 5);
    textColor(doc, INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const raw = Number(metrics[item.key]);
    const value = item.kind === "percent" ? formatPercent(raw) : formatCount(raw);
    doc.text(value, cardX + 3, cardY + 15.5);
    if (item.kind === "percent") {
      const barX = cardX + 28;
      const barW = cardW - 34;
      fill(doc, SOFT);
      doc.roundedRect(barX, cardY + 12, barW, 3, 1, 1, "F");
      fill(doc, TESTED);
      const widthRatio = Math.max(0, Math.min(1, raw));
      if (widthRatio > 0) {
        doc.roundedRect(barX, cardY + 12, Math.max(barW * widthRatio, 1.5), 3, 1, 1, "F");
      }
    }
  });
  return 3 * (cardH + gap);
}

export function downloadPdf(input: {
  rows: Submission[];
  metrics: Metrics;
  charts: ChartSeries;
  filters: Filters;
}): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  const { w, h, margin } = PAGE;
  const contentW = w - margin * 2;
  const scope = describeFilters(input.filters);

  textColor(doc, TESTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WAD 2026", margin, margin + 2);
  textColor(doc, INK);
  doc.setFontSize(16);
  doc.text("Dashibodi ya ufuatiliaji", margin, margin + 9);
  textColor(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(scope, margin, margin + 15);
  doc.text(`${formatCount(input.rows.length)} taarifa`, w - margin, margin + 15, { align: "right" });

  const kpiHeight = drawKpis(doc, input.metrics, margin, margin + 20, contentW);
  let y = margin + 20 + kpiHeight + 2;
  const columnW = (contentW - 4) / 2;
  const chartH = 40;

  const status = input.charts.status.map((item) => ({
    label: item.label,
    value: item.count,
    color: STATUS_COLOR[item.label] ?? MUTED,
  }));
  drawBars(doc, margin, y, columnW, chartH, "Hali ya shughuli", status);
  drawGrouped(doc, margin + columnW + 4, y, columnW, chartH, "Upimaji na maambukizi kwa jinsia", input.charts.gender);
  y += chartH + 3;

  drawTrend(doc, margin, y, contentW, 44, input.charts.days.length > 0 ? input.charts.days : [{ date: "", tested: 0, positive: 0 }]);
  y += 47;

  const placeValue = input.charts.placeValue === "tested" ? "tested" : "activities";
  drawBars(
    doc,
    margin,
    y,
    columnW,
    chartH,
    placeChartTitle(input.charts),
    input.charts.places.map((item) => ({ label: item.label, value: item[placeValue] })),
  );
  drawBars(
    doc,
    margin + columnW + 4,
    y,
    columnW,
    chartH,
    "Aina ya shughuli",
    input.charts.activities.map((item) => ({ label: item.label, value: item.count })),
  );
  y += chartH + 3;
  drawBars(
    doc,
    margin,
    y,
    contentW,
    32,
    "Vifaa vilivyogawanywa",
    input.charts.supplies.map((item) => ({ label: item.label, value: item.value })),
  );

  const reportRows = toReportRows(input.rows);
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

  doc.addPage();
  textColor(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Matokeo ya kila siku", margin, margin + 4);
  textColor(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Jumla ya upimaji na maambukizi ni Me + Ke.", margin, margin + 9);

  const head = [[
    "Na.",
    "Siku",
    "Kanda",
    "Mkoa",
    "Halmashauri",
    "Shughuli",
    "Aina",
    "Hali",
    "Eneo",
    "Mdau",
    "Me",
    "Ke",
    "Jumla",
    "Me",
    "Ke",
    "Jumla",
    "Huduma",
    "Elimu",
    "Kondomu",
    "PEP",
    "Jipime",
    "Ushahidi",
  ]];
  const body = reportRows.map((row) => [
    row.na,
    formatDate(row.tarehe),
    row.kanda,
    row.mkoa,
    row.halmashauri,
    row.shughuli,
    row.aina,
    row.hali,
    row.eneo,
    row.mdau,
    formatCount(row.vvuMe),
    formatCount(row.vvuKe),
    formatCount(row.vvuJumla),
    formatCount(row.maambukiziMe),
    formatCount(row.maambukiziKe),
    formatCount(row.maambukiziJumla),
    formatCount(row.waliounganishwa),
    formatCount(row.elimu),
    formatCount(row.kondomu),
    formatCount(row.pep),
    formatCount(row.jipime),
    row.ushahidi,
  ]);
  const foot = [[
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
    formatCount(totals.vvuMe),
    formatCount(totals.vvuKe),
    formatCount(totals.vvuJumla),
    formatCount(totals.maambukiziMe),
    formatCount(totals.maambukiziKe),
    formatCount(totals.maambukiziJumla),
    formatCount(totals.waliounganishwa),
    formatCount(totals.elimu),
    formatCount(totals.kondomu),
    formatCount(totals.pep),
    formatCount(totals.jipime),
    "",
  ]];

  autoTable(doc, {
    startY: margin + 13,
    margin: { top: margin, right: margin, bottom: 14, left: margin },
    head,
    body: body.length > 0 ? body : [["Hakuna taarifa kwa kichujio hiki."]],
    foot: body.length > 0 ? foot : undefined,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 6.5,
      cellPadding: 1.1,
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.1,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: { fillColor: TESTED, textColor: WHITE, fontStyle: "bold", halign: "center" },
    footStyles: { fillColor: SOFT, textColor: INK, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 8 },
      10: { halign: "right" },
      11: { halign: "right" },
      12: { halign: "right" },
      13: { halign: "right" },
      14: { halign: "right" },
      15: { halign: "right" },
      16: { halign: "right" },
      17: { halign: "right" },
      18: { halign: "right" },
      19: { halign: "right" },
      20: { halign: "right" },
    },
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    textColor(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("WAD 2026", margin, h - 6);
    doc.text(`${page} / ${pages}`, w - margin, h - 6, { align: "right" });
  }

  doc.save(`wad-2026-${fileStamp()}.pdf`);
}
