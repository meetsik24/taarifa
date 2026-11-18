import type { Filters, Metrics, Submission } from "./types";

/**
 * Dashboard formulas from the workbook (sheet "Dashboard"):
 * - Shughuli zilizopangwa = COUNTIF(shughuli, "<>")
 * - Shughuli zilizokamilika = COUNTIF(hali, "Imekamilika")
 * - Shughuli zinazoendelea = COUNTIF(hali, "Inaendelea")
 * - Asilimia ya kukamilika = IFERROR(completed / planned, 0)
 * - Waliopima VVU = sum of (Me + Ke) tested
 * - Waliokutwa na Maambukizi ya VVU = sum of (Me + Ke) positive
 * - Waliofikiwa na Elimu, Kondomu, PEP/PrEP = column sums
 * The sheet's own Jumla cells are not used; Jumla is Me + Ke.
 * Haijaanza and Imesitishwa stay in the planned count only.
 */
export function computeMetrics(rows: Submission[]): Metrics {
  let planned = 0;
  let completed = 0;
  let ongoing = 0;
  let tested = 0;
  let positive = 0;
  let educated = 0;
  let condoms = 0;
  let pep = 0;

  for (const row of rows) {
    if (row.shughuli.trim() !== "") planned += 1;
    if (row.hali === "Imekamilika") completed += 1;
    if (row.hali === "Inaendelea") ongoing += 1;
    tested += row.vvuMe + row.vvuKe;
    positive += row.maambukiziMe + row.maambukiziKe;
    educated += row.elimu;
    condoms += row.kondomu;
    pep += row.pep;
  }

  return {
    planned,
    completed,
    ongoing,
    completionRatio: planned === 0 ? 0 : completed / planned,
    tested,
    positive,
    educated,
    condoms,
    pep,
    rows: rows.length,
  };
}

export function applyFilters(rows: Submission[], filters: Filters): Submission[] {
  const kanda = filters.kanda.trim().toLowerCase();
  const mkoa = filters.mkoa.trim().toLowerCase();
  const halmashauri = filters.halmashauri.trim().toLowerCase();
  const aina = filters.aina.trim();
  const kuanzia = filters.kuanzia.trim();
  const hadi = filters.hadi.trim();

  return rows.filter((row) => {
    if (kanda && row.kanda.trim().toLowerCase() !== kanda) return false;
    if (mkoa && row.mkoa.trim().toLowerCase() !== mkoa) return false;
    if (halmashauri && row.halmashauri.trim().toLowerCase() !== halmashauri) {
      return false;
    }
    if (aina && row.aina !== aina) return false;
    if (kuanzia && row.tarehe < kuanzia) return false;
    if (hadi && row.tarehe > hadi) return false;
    return true;
  });
}

export function distinctPlaces(rows: Submission[]): {
  kanda: string[];
  mkoa: string[];
  halmashauri: string[];
} {
  const kanda = new Set<string>();
  const mkoa = new Set<string>();
  const halmashauri = new Set<string>();
  for (const row of rows) {
    if (row.kanda.trim()) kanda.add(row.kanda.trim());
    if (row.mkoa.trim()) mkoa.add(row.mkoa.trim());
    if (row.halmashauri.trim()) halmashauri.add(row.halmashauri.trim());
  }
  const sort = (values: Set<string>) =>
    [...values].sort((a, b) => a.localeCompare(b, "sw"));
  return {
    kanda: sort(kanda),
    mkoa: sort(mkoa),
    halmashauri: sort(halmashauri),
  };
}
