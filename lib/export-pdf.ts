import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatCount, formatDate, formatPercent } from "./format";
import { KPI_ITEMS, describeFilters, fileStamp, placeChartTitle, toReportRows } from "./export-report";
import { copy, fill as template, translateTerm, type Locale } from "./messages";
import { ACTIVITY_TYPES, activityTypesIn } from "./options";
import type { ChartSeries } from "./charts";
import type { Filters, Metrics, Submission } from "./types";

type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];

function fill(doc: jsPDF, color: RGB): void {
  doc.setFillColor(color[0], color[1], color[2]);
}

function draw(doc: jsPDF, color: RGB): void {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function textColor(doc: jsPDF, color: RGB): void {
  doc.setTextColor(color[0], color[1], color[2]);
}

const BRAND: RGB = [197, 22, 140];
const BRAND_CYAN: RGB = [4, 173, 238];
const BRAND_INK: RGB = [26, 18, 24];
const BRAND_MUTED: RGB = [92, 70, 84];
const BRAND_SOFT: RGB = [248, 232, 242];
const BRAND_LINE: RGB = [234, 221, 228];

function formValue(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean || "—";
}

function sectionBand(doc: jsPDF, x: number, y: number, width: number, title: string): number {
  fill(doc, BRAND_SOFT);
  doc.rect(x, y, width, 7, "F");
  fill(doc, BRAND);
  doc.rect(x, y, 1.4, 7, "F");
  textColor(doc, BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title.toUpperCase(), x + 4, y + 4.6);
  return y + 9.5;
}

function fieldCard(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string): void {
  draw(doc, BRAND_LINE);
  doc.setLineWidth(0.2);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 1.2, 1.2, "FD");
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(label, x + 2.4, y + 4);
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(formValue(value), w - 5) as string[];
  doc.text(lines, x + 2.4, y + 8.6);
}

function cardRow(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  items: Array<{ label: string; value: string }>,
): number {
  const gap = 2.2;
  const colW = (width - gap * (items.length - 1)) / items.length;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  const height = Math.max(
    16,
    ...items.map((item) => {
      const lines = doc.splitTextToSize(formValue(item.value), colW - 5) as string[];
      return 8 + lines.length * 4.2 + 2.4;
    }),
  );
  items.forEach((item, index) => {
    fieldCard(doc, x + index * (colW + gap), y, colW, height, item.label, item.value);
  });
  return y + height + 2.4;
}

function tickBox(doc: jsPDF, x: number, y: number, on: boolean): void {
  if (on) {
    fill(doc, BRAND);
    doc.roundedRect(x, y, 3.5, 3.5, 0.5, 0.5, "F");
    draw(doc, WHITE);
    doc.setLineWidth(0.45);
    doc.line(x + 0.7, y + 1.8, x + 1.45, y + 2.65);
    doc.line(x + 1.45, y + 2.65, x + 2.85, y + 0.85);
    return;
  }
  draw(doc, BRAND_LINE);
  doc.setLineWidth(0.25);
  fill(doc, WHITE);
  doc.roundedRect(x, y, 3.5, 3.5, 0.5, 0.5, "FD");
}

async function readLogo(): Promise<string | null> {
  try {
    const response = await fetch("/tacaids.png");
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function paintForm(doc: jsPDF, row: Submission, locale: Locale, logo: string | null): void {
  const t = copy[locale];
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const tested = row.vvuMe + row.vvuKe;
  const positive = row.maambukiziMe + row.maambukiziKe;
  const logoW = 22;
  const logoH = logoW * (1024 / 934);

  fill(doc, BRAND);
  doc.rect(0, 0, pageW, 3.2, "F");
  fill(doc, BRAND_CYAN);
  doc.rect(0, 3.2, pageW, 1.4, "F");
  if (logo) doc.addImage(logo, "PNG", margin, 9, logoW, logoH, undefined, "FAST");

  const textX = margin + (logo ? logoW + 5 : 0);
  const contentW = pageW - margin * 2;
  textColor(doc, BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TACAIDS · WAD 2026", textX, 15);
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(template(t.export.record, { id: row.id }), pageW - margin, 15, { align: "right" });

  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const titleWidth = pageW - textX - margin - 4;
  const titleLines = doc.splitTextToSize(t.export.formTitle, titleWidth) as string[];
  doc.text(titleLines.slice(0, 2), textX, 22);
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const orgLines = doc.splitTextToSize(t.brand.org, titleWidth) as string[];
  const orgY = 22 + titleLines.slice(0, 2).length * 5.6 + 1;
  doc.text(orgLines.slice(0, 2), textX, orgY);

  let y = Math.max(logo ? 9 + logoH : 28, orgY + orgLines.slice(0, 2).length * 4) + 5;
  const room = (needed: number): void => {
    if (y + needed <= pageH - 16) return;
    doc.addPage();
    y = margin;
  };
  room(36);
  y = sectionBand(doc, margin, y, contentW, t.fields.placeAndDate);
  y = cardRow(doc, margin, y, contentW, [
    { label: t.fields.date, value: formatDate(row.tarehe) },
    { label: t.fields.zone, value: row.kanda },
    { label: t.fields.region, value: row.mkoa },
  ]);
  y = cardRow(doc, margin, y, contentW, [
    { label: t.fields.council, value: row.halmashauri },
    { label: t.fields.status, value: translateTerm(locale, row.hali) },
  ]);

  room(40);
  y = sectionBand(doc, margin, y + 1, contentW, t.fields.activitySection);
  y = cardRow(doc, margin, y, contentW, [
    { label: t.fields.activity, value: row.shughuli },
    { label: t.fields.area, value: row.eneo },
    { label: t.fields.actor, value: row.mdau },
  ]);

  const selected = new Set(activityTypesIn(row.aina));
  const colW = contentW / 2;
  ACTIVITY_TYPES.forEach((type, index) => {
    const column = index % 2;
    const line = Math.floor(index / 2);
    const x = margin + column * colW;
    const boxY = y + line * 6.6;
    const on = selected.has(type);
    tickBox(doc, x, boxY, on);
    textColor(doc, on ? BRAND_INK : BRAND_MUTED);
    doc.setFont("helvetica", on ? "bold" : "normal");
    doc.setFontSize(9);
    doc.text(translateTerm(locale, type), x + 5, boxY + 2.7);
  });
  y += Math.ceil(ACTIVITY_TYPES.length / 2) * 6.6 + 2.4;
  if (row.nyingine.trim()) {
    y = cardRow(doc, margin, y, contentW, [{ label: t.fields.otherActivity, value: row.nyingine }]);
  }

  room(42);
  y = sectionBand(doc, margin, y + 1, contentW, t.fields.tested);
  const columns = [contentW * 0.46, contentW * 0.18, contentW * 0.18, contentW * 0.18];
  const heads = ["", t.words.me, t.words.ke, t.words.total];
  const countRows = [
    [t.table.testedGroup, formatCount(row.vvuMe), formatCount(row.vvuKe), formatCount(tested)],
    [t.table.positiveGroup, formatCount(row.maambukiziMe), formatCount(row.maambukiziKe), formatCount(positive)],
  ];
  const rowH = 8;
  heads.forEach((head, index) => {
    const x = margin + columns.slice(0, index).reduce((sum, width) => sum + width, 0);
    fill(doc, BRAND);
    doc.rect(x, y, columns[index] ?? 0, rowH, "F");
    textColor(doc, WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const align = index === 0 ? "left" : "right";
    const textXPos = index === 0 ? x + 2.4 : x + (columns[index] ?? 0) - 2.4;
    doc.text(head, textXPos, y + 5.2, { align });
  });
  y += rowH;
  countRows.forEach((cells, rowIndex) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const labelLines = doc.splitTextToSize(cells[0] ?? "", (columns[0] ?? 0) - 4.8) as string[];
    const lineH = Math.max(rowH, labelLines.length * 4.2 + 3);
    room(lineH);
    cells.forEach((cell, index) => {
      const x = margin + columns.slice(0, index).reduce((sum, width) => sum + width, 0);
      fill(doc, rowIndex % 2 === 0 ? BRAND_SOFT : WHITE);
      doc.rect(x, y, columns[index] ?? 0, lineH, "F");
      textColor(doc, index === 0 ? BRAND_MUTED : BRAND_INK);
      doc.setFont("helvetica", index === 0 ? "normal" : "bold");
      doc.setFontSize(9);
      if (index === 0) {
        doc.text(labelLines, x + 2.4, y + 5.3);
        return;
      }
      doc.text(cell, x + (columns[index] ?? 0) - 2.4, y + lineH / 2 + 1.2, { align: "right" });
    });
    y += lineH;
  });
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const note = doc.splitTextToSize(t.export.dailyNote, contentW) as string[];
  doc.text(note, margin, y + 4.2);
  y += note.length * 3.4 + 4;

  room(28);
  y = sectionBand(doc, margin, y, contentW, t.fields.services);
  const services: Array<[string, number]> = [
    [t.fields.linked, row.waliounganishwa],
    [t.fields.educated, row.elimu],
    [t.fields.condoms, row.kondomu],
    [t.fields.pep, row.pep],
    [t.fields.selfTests, row.jipime],
  ];
  services.forEach((service, index) => {
    const [label, value] = service;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(label, contentW - 24) as string[];
    const rowHeight = Math.max(7.2, lines.length * 4.2 + 2.8);
    fill(doc, index % 2 === 0 ? BRAND_SOFT : WHITE);
    doc.rect(margin, y, contentW, rowHeight, "F");
    textColor(doc, BRAND_INK);
    doc.text(lines, margin + 2.4, y + 4.7);
    doc.setFont("helvetica", "bold");
    doc.text(formatCount(value), margin + contentW - 2.4, y + rowHeight / 2 + 1.2, { align: "right" });
    y += rowHeight;
  });
  y += 3;

  room(28);
  y = sectionBand(doc, margin, y, contentW, t.export.evidence);
  cardRow(doc, margin, y, contentW, [{ label: t.export.evidence, value: row.ushahidi }]);

}

function stampPages(doc: jsPDF, right: (page: number, pages: number) => string): void {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 12;
    draw(doc, BRAND_LINE);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    textColor(doc, BRAND_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("WAD 2026", margin, pageH - 7);
    doc.text(right(page, pages), pageW - margin, pageH - 7, { align: "right" });
  }
}

function paintBanner(
  doc: jsPDF,
  logo: string | null,
  title: string,
  org: string,
  rightNote: string,
): { margin: number; contentW: number; pageH: number; y: number } {
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const logoW = 22;
  const logoH = logoW * (1024 / 934);
  fill(doc, BRAND);
  doc.rect(0, 0, pageW, 3.2, "F");
  fill(doc, BRAND_CYAN);
  doc.rect(0, 3.2, pageW, 1.4, "F");
  if (logo) doc.addImage(logo, "PNG", margin, 9, logoW, logoH, undefined, "FAST");

  const textX = margin + (logo ? logoW + 5 : 0);
  const contentW = pageW - margin * 2;
  textColor(doc, BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TACAIDS · WAD 2026", textX, 15);
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(rightNote, pageW - margin, 15, { align: "right" });

  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const titleWidth = pageW - textX - margin - 4;
  const titleLines = doc.splitTextToSize(title, titleWidth) as string[];
  doc.text(titleLines.slice(0, 2), textX, 22);
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const orgLines = doc.splitTextToSize(org, titleWidth) as string[];
  const orgY = 22 + titleLines.slice(0, 2).length * 5.6 + 1;
  doc.text(orgLines.slice(0, 2), textX, orgY);
  const y = Math.max(logo ? 9 + logoH : 28, orgY + orgLines.slice(0, 2).length * 4) + 5;
  return { margin, contentW, pageH, y };
}

export async function downloadFormPdf(row: Submission, locale: Locale = "sw"): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logo = await readLogo();
  paintForm(doc, row, locale, logo);
  const record = template(copy[locale].export.record, { id: row.id });
  stampPages(doc, (page, pages) => `${record} · ${page} / ${pages}`);
  doc.save(`wad-2026-fomu-${row.id}.pdf`);
}

const STATUS_COLOR: Record<string, RGB> = {
  Imekamilika: BRAND,
  Inaendelea: BRAND_CYAN,
  Haijaanza: BRAND_MUTED,
  Imesitishwa: [120, 48, 78],
};

function clipLabel(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function drawBars(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  rows: Array<{ label: string; value: number; color?: RGB }>,
  emptyLabel: string,
): void {
  draw(doc, BRAND_LINE);
  doc.setLineWidth(0.2);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(clipLabel(title, 42), x + 3, y + 6);
  const items = rows.length > 0 ? rows : [{ label: emptyLabel, value: 0 }];
  const max = Math.max(...items.map((item) => item.value), 1);
  const top = y + 10;
  const rowH = (h - 14) / items.length;
  items.forEach((item, index) => {
    const rowY = top + index * rowH;
    textColor(doc, BRAND_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(clipLabel(item.label, 18), x + 3, rowY + 3.2);
    const barX = x + 34;
    const barW = w - 50;
    fill(doc, BRAND_SOFT);
    doc.rect(barX, rowY, barW, 3, "F");
    fill(doc, item.color ?? BRAND);
    doc.rect(barX, rowY, barW * (item.value / max), 3, "F");
    textColor(doc, BRAND_INK);
    doc.setFont("helvetica", "bold");
    doc.text(formatCount(item.value), x + w - 3, rowY + 3.2, { align: "right" });
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
  meLabel: string,
  keLabel: string,
): void {
  draw(doc, BRAND_LINE);
  doc.setLineWidth(0.2);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(clipLabel(title, 40), x + 3, y + 6);
  doc.setFontSize(7);
  textColor(doc, BRAND);
  doc.text(meLabel, x + w - 24, y + 6);
  textColor(doc, BRAND_CYAN);
  doc.text(keLabel, x + w - 10, y + 6);
  const max = Math.max(...rows.flatMap((row) => [row.me, row.ke]), 1);
  const top = y + 12;
  const rowH = (h - 16) / Math.max(rows.length, 1);
  rows.forEach((row, index) => {
    const rowY = top + index * rowH;
    textColor(doc, BRAND_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(clipLabel(row.label, 16), x + 3, rowY + 4);
    const barX = x + 32;
    const barW = w - 52;
    fill(doc, BRAND_SOFT);
    doc.rect(barX, rowY, barW, 2.6, "F");
    doc.rect(barX, rowY + 3.4, barW, 2.6, "F");
    fill(doc, BRAND);
    doc.rect(barX, rowY, barW * (row.me / max), 2.6, "F");
    fill(doc, BRAND_CYAN);
    doc.rect(barX, rowY + 3.4, barW * (row.ke / max), 2.6, "F");
    textColor(doc, BRAND_INK);
    doc.setFont("helvetica", "bold");
    doc.text(`${formatCount(row.me)} / ${formatCount(row.ke)}`, x + w - 3, rowY + 4, { align: "right" });
  });
}

function drawTrend(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  days: ChartSeries["days"],
  title: string,
  testedLabel: string,
  positiveLabel: string,
): void {
  draw(doc, BRAND_LINE);
  doc.setLineWidth(0.2);
  fill(doc, WHITE);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, x + 3, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  textColor(doc, BRAND);
  doc.text(testedLabel, x + w - 46, y + 6);
  textColor(doc, BRAND_CYAN);
  doc.text(positiveLabel, x + w - 3, y + 6, { align: "right" });
  const plotX = x + 6;
  const plotW = w - 12;
  const base = y + h - 10;
  const plotH = h - 20;
  const max = Math.max(...days.map((day) => day.tested), 1);
  const slot = plotW / Math.max(days.length, 1);
  days.forEach((day, index) => {
    const barW = Math.max(1.2, slot * 0.28);
    const left = plotX + index * slot + slot * 0.2;
    fill(doc, BRAND);
    doc.rect(left, base - plotH * (day.tested / max), barW, plotH * (day.tested / max), "F");
    fill(doc, BRAND_CYAN);
    doc.rect(left + barW + 0.5, base - plotH * (day.positive / max), barW, plotH * (day.positive / max), "F");
  });
  textColor(doc, BRAND_MUTED);
  doc.setFontSize(7);
  const first = days.find((day) => day.date)?.date ?? "";
  const last = [...days].reverse().find((day) => day.date)?.date ?? "";
  if (first) doc.text(`${formatDate(first)} – ${formatDate(last)}`, x + 3, y + h - 3.5);
}

function openPortrait(doc: jsPDF, title: string): { margin: number; contentW: number; y: number } {
  doc.addPage("a4", "p");
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  fill(doc, BRAND);
  doc.rect(0, 0, pageW, 2.4, "F");
  fill(doc, BRAND_CYAN);
  doc.rect(0, 2.4, pageW, 1, "F");
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, margin, 14);
  return { margin, contentW: pageW - margin * 2, y: 20 };
}

export async function downloadPdf(input: {
  rows: Submission[];
  metrics: Metrics;
  charts: ChartSeries;
  filters: Filters;
  locale?: Locale;
}): Promise<void> {
  const locale = input.locale ?? "sw";
  const t = copy[locale];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logo = await readLogo();
  const banner = paintBanner(
    doc,
    logo,
    t.export.dashboard,
    t.brand.org,
    template(t.export.reportCount, { count: formatCount(input.rows.length) }),
  );
  const { margin, contentW } = banner;
  let y = banner.y;
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const scope = doc.splitTextToSize(describeFilters(input.filters, locale), contentW) as string[];
  doc.text(scope, margin, y);
  y += scope.length * 4.2 + 3;
  y = sectionBand(doc, margin, y, contentW, t.kpis.title);
  const indicators = KPI_ITEMS.map((item) => {
    const key = item.key as Exclude<keyof typeof t.kpis, "title" | "subtitle">;
    const raw = Number(input.metrics[item.key]);
    return {
      label: t.kpis[key],
      value: item.kind === "percent" ? formatPercent(raw) : formatCount(raw),
    };
  });
  const gap = 2.2;
  const colW = (contentW - gap) / 2;
  indicators.forEach((item, index) => {
    const column = index % 2;
    if (column === 0 && index > 0) y += 18.2;
    const x = margin + column * (colW + gap);
    draw(doc, BRAND_LINE);
    doc.setLineWidth(0.2);
    fill(doc, WHITE);
    doc.roundedRect(x, y, colW, 16, 1.2, 1.2, "FD");
    textColor(doc, BRAND_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const lines = doc.splitTextToSize(item.label, colW - 6) as string[];
    doc.text(lines.slice(0, 2), x + 2.4, y + 4.2);
    textColor(doc, BRAND_INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(item.value, x + 2.4, y + 13);
  });
  y += 22;
  textColor(doc, BRAND_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const note = doc.splitTextToSize(t.export.dailyNote, contentW) as string[];
  doc.text(note, margin, y);

  const charts = openPortrait(doc, t.charts.title);
  const half = (charts.contentW - 4) / 2;
  const statusRows = input.charts.status.map((item) => ({
    label: translateTerm(locale, item.label),
    value: item.count,
    color: STATUS_COLOR[item.label] ?? BRAND_MUTED,
  }));
  const panelH = 58;
  drawBars(doc, charts.margin, charts.y, half, panelH, t.charts.statusTitle, statusRows, t.export.noData);
  drawGrouped(
    doc,
    charts.margin + half + 4,
    charts.y,
    half,
    panelH,
    t.charts.genderTitle,
    input.charts.gender.map((item) => ({ ...item, label: translateTerm(locale, item.label) })),
    t.words.me,
    t.words.ke,
  );
  drawTrend(
    doc,
    charts.margin,
    charts.y + panelH + 4,
    charts.contentW,
    78,
    input.charts.days.length > 0 ? input.charts.days : [{ date: "", tested: 0, positive: 0 }],
    t.charts.trendTitle,
    t.charts.tested,
    t.charts.infections,
  );

  const places = openPortrait(doc, t.charts.title);
  const placeRows = input.charts.places.map((item) => ({
    label: translateTerm(locale, item.label),
    value: item[input.charts.placeValue],
  }));
  const activityRows = input.charts.activities.map((item) => ({
    label: translateTerm(locale, item.label),
    value: item.count,
  }));
  const listH = 118;
  drawBars(doc, places.margin, places.y, half, listH, placeChartTitle(input.charts, locale), placeRows, t.export.noData);
  drawBars(
    doc,
    places.margin + half + 4,
    places.y,
    half,
    listH,
    t.charts.activityTitle,
    activityRows,
    t.export.noData,
  );
  drawBars(
    doc,
    places.margin,
    places.y + listH + 4,
    places.contentW,
    48,
    t.charts.suppliesTitle,
    input.charts.supplies.map((item) => ({ label: translateTerm(locale, item.label), value: item.value })),
    t.export.noData,
  );

  const reportRows = toReportRows(input.rows, locale);
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

  doc.addPage("a4", "l");
  const wide = doc.internal.pageSize.getWidth();
  fill(doc, BRAND);
  doc.rect(0, 0, wide, 2.4, "F");
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(t.table.title, 12, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  textColor(doc, BRAND_MUTED);
  doc.text(t.export.dailyNote, 12, 17);

  const tableMargin = { top: 14, right: 10, bottom: 16, left: 10 };
  const tableStyles = {
    font: "helvetica" as const,
    fontSize: 7,
    cellPadding: 1.2,
    textColor: BRAND_INK,
    lineColor: BRAND_LINE,
    lineWidth: 0.1,
    overflow: "linebreak" as const,
    valign: "top" as const,
  };

  autoTable(doc, {
    startY: 21,
    margin: tableMargin,
    head: [[
      t.words.number,
      t.words.day,
      t.fields.zone,
      t.fields.region,
      t.fields.council,
      t.fields.activity,
      t.fields.activityType,
      t.fields.status,
      t.fields.area,
      t.fields.actor,
    ]],
    body: reportRows.length > 0
      ? reportRows.map((row) => [
          row.na,
          formatDate(row.tarehe),
          row.kanda,
          row.mkoa,
          row.halmashauri,
          row.shughuli,
          row.aina,
          row.sampuli ? `${row.hali} · ${row.sampuli}` : row.hali,
          row.eneo,
          row.mdau,
        ])
      : [[t.export.emptyTable]],
    theme: "grid",
    styles: tableStyles,
    headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND_SOFT },
  });

  doc.addPage("a4", "l");
  const countWidth = doc.internal.pageSize.getWidth();
  fill(doc, BRAND);
  doc.rect(0, 0, countWidth, 2.4, "F");
  textColor(doc, BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(t.fields.tested, 12, 12);

  autoTable(doc, {
    startY: 18,
    margin: tableMargin,
    head: [[
      { content: t.words.number, rowSpan: 2 },
      { content: t.words.day, rowSpan: 2 },
      { content: t.fields.activity, rowSpan: 2 },
      { content: t.table.testedGroup, colSpan: 3, styles: { halign: "center" } },
      { content: t.table.positiveGroup, colSpan: 3, styles: { halign: "center" } },
      { content: t.table.linked, rowSpan: 2 },
      { content: t.table.educated, rowSpan: 2 },
      { content: t.table.condoms, rowSpan: 2 },
      { content: "PEP/PrEP", rowSpan: 2 },
      { content: t.export.selfTest, rowSpan: 2 },
      { content: t.export.evidence, rowSpan: 2 },
    ], [
      t.words.me,
      t.words.ke,
      t.words.total,
      t.words.me,
      t.words.ke,
      t.words.total,
    ]],
    body: reportRows.map((row) => [
      row.na,
      formatDate(row.tarehe),
      row.shughuli,
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
    ]),
    foot: reportRows.length > 0
      ? [[
          "",
          "",
          t.words.total,
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
        ]]
      : undefined,
    theme: "grid",
    styles: { ...tableStyles, fontSize: 6.5, halign: "right" },
    headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: "bold", halign: "center" },
    footStyles: { fillColor: BRAND_SOFT, textColor: BRAND_INK, fontStyle: "bold" },
    columnStyles: {
      0: { halign: "left", cellWidth: 8 },
      1: { halign: "left", cellWidth: 18 },
      2: { halign: "left", cellWidth: 36 },
      14: { halign: "left" },
    },
    showHead: "everyPage",
    showFoot: "lastPage",
  });

  stampPages(doc, (page, pages) => `${page} / ${pages}`);
  doc.save(`wad-2026-${fileStamp()}.pdf`);
}
