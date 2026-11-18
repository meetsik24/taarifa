import { STATUSES } from "./options";
import type { Submission } from "./types";

/** How many place names to draw before folding the rest into "Nyingine". */
const PLACE_LIMIT = 8;

export type PlaceGrain = "kanda" | "mkoa" | "halmashauri";

export type StatusPoint = {
  label: string;
  count: number;
};

export type DayPoint = {
  date: string;
  tested: number;
  positive: number;
};

export type GenderPoint = {
  label: string;
  me: number;
  ke: number;
};

export type PlacePoint = {
  label: string;
  tested: number;
  positive: number;
  activities: number;
};

export type ActivityPoint = {
  label: string;
  count: number;
};

export type SupplyPoint = {
  label: string;
  value: number;
};

export type ChartSeries = {
  total: number;
  tested: number;
  positive: number;
  /** Positive / tested. 0 when nobody was tested. */
  positivity: number;
  linked: number;
  status: StatusPoint[];
  days: DayPoint[];
  gender: GenderPoint[];
  placeGrain: PlaceGrain;
  /** True when more than PLACE_LIMIT names were folded into "Nyingine". */
  placesTruncated: boolean;
  /** Draw activity counts when nobody in the filtered rows was tested. */
  placeValue: "tested" | "activities";
  places: PlacePoint[];
  activities: ActivityPoint[];
  supplies: SupplyPoint[];
};

function add(map: Map<string, number>, key: string, amount: number) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function placeGrain(rows: Submission[]): PlaceGrain {
  const kanda = new Set<string>();
  const mkoa = new Set<string>();
  for (const row of rows) {
    if (row.kanda.trim()) kanda.add(row.kanda.trim().toLowerCase());
    if (row.mkoa.trim()) mkoa.add(row.mkoa.trim().toLowerCase());
  }
  if (kanda.size > 1) return "kanda";
  if (mkoa.size > 1) return "mkoa";
  return "halmashauri";
}

function statusSeries(rows: Submission[]): StatusPoint[] {
  const counts = new Map<string, number>();
  for (const label of STATUSES) counts.set(label, 0);
  for (const row of rows) {
    const label = row.hali.trim() || "Haijulikani";
    add(counts, label, 1);
  }
  const known = STATUSES.map((label) => ({ label, count: counts.get(label) ?? 0 }));
  const extra = [...counts.entries()]
    .filter(([label]) => !(STATUSES as readonly string[]).includes(label))
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "sw"));
  return [...known, ...extra];
}

function daySeries(rows: Submission[]): DayPoint[] {
  const byDate = new Map<string, DayPoint>();
  for (const row of rows) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(row.tarehe) ? row.tarehe : "";
    const current = byDate.get(date) ?? { date, tested: 0, positive: 0 };
    current.tested += row.vvuMe + row.vvuKe;
    current.positive += row.maambukiziMe + row.maambukiziKe;
    byDate.set(date, current);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function placeSeries(rows: Submission[], grain: PlaceGrain): {
  places: PlacePoint[];
  truncated: boolean;
  value: "tested" | "activities";
} {
  const byName = new Map<string, PlacePoint>();
  for (const row of rows) {
    const label = row[grain].trim() || "Haijatajwa";
    const current = byName.get(label) ?? { label, tested: 0, positive: 0, activities: 0 };
    current.tested += row.vvuMe + row.vvuKe;
    current.positive += row.maambukiziMe + row.maambukiziKe;
    current.activities += 1;
    byName.set(label, current);
  }

  const ranked = [...byName.values()].sort(
    (a, b) => b.tested - a.tested || b.activities - a.activities || a.label.localeCompare(b.label, "sw"),
  );
  const value = ranked.some((item) => item.tested > 0) ? "tested" : "activities";
  if (value === "activities") {
    ranked.sort(
      (a, b) => b.activities - a.activities || a.label.localeCompare(b.label, "sw"),
    );
  }

  if (ranked.length <= PLACE_LIMIT) {
    return { places: ranked, truncated: false, value };
  }

  const head = ranked.slice(0, PLACE_LIMIT);
  const rest = ranked.slice(PLACE_LIMIT);
  const other = rest.reduce<PlacePoint>(
    (sum, item) => ({
      label: "Nyingine",
      tested: sum.tested + item.tested,
      positive: sum.positive + item.positive,
      activities: sum.activities + item.activities,
    }),
    { label: "Nyingine", tested: 0, positive: 0, activities: 0 },
  );
  return { places: [...head, other], truncated: true, value };
}

function activitySeries(rows: Submission[]): ActivityPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) add(counts, row.aina.trim() || "Haijatajwa", 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "sw"));
}

/**
 * Series for the dashboard charts. Totals follow the sheet rules:
 * tested and positive are Me + Ke, and days are grouped on tarehe.
 */
export function buildChartSeries(rows: Submission[]): ChartSeries {
  let tested = 0;
  let positive = 0;
  let linked = 0;
  let vvuMe = 0;
  let vvuKe = 0;
  let maambukiziMe = 0;
  let maambukiziKe = 0;
  let condoms = 0;
  let pep = 0;
  let jipime = 0;

  for (const row of rows) {
    vvuMe += row.vvuMe;
    vvuKe += row.vvuKe;
    maambukiziMe += row.maambukiziMe;
    maambukiziKe += row.maambukiziKe;
    tested += row.vvuMe + row.vvuKe;
    positive += row.maambukiziMe + row.maambukiziKe;
    linked += row.waliounganishwa;
    condoms += row.kondomu;
    pep += row.pep;
    jipime += row.jipime;
  }

  const grain = placeGrain(rows);
  const places = placeSeries(rows, grain);

  return {
    total: rows.length,
    tested,
    positive,
    positivity: tested === 0 ? 0 : positive / tested,
    linked,
    status: statusSeries(rows),
    days: daySeries(rows),
    gender: [
      { label: "Waliopima", me: vvuMe, ke: vvuKe },
      { label: "Maambukizi", me: maambukiziMe, ke: maambukiziKe },
    ],
    placeGrain: grain,
    placesTruncated: places.truncated,
    placeValue: places.value,
    places: places.places,
    activities: activitySeries(rows),
    supplies: [
      { label: "Kondomu", value: condoms },
      { label: "PEP/PrEP", value: pep },
      { label: "Jipime", value: jipime },
    ],
  };
}
