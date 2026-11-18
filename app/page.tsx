import { Delete02Icon } from "@hugeicons/core-free-icons";
import { clearSamples } from "@/app/actions";
import { AppIcon } from "@/components/app-icon";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DailyTable } from "@/components/DailyTable";
import { Filters } from "@/components/Filters";
import { KpiGrid } from "@/components/KpiGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildChartSeries } from "@/lib/charts";
import { countSamples, listSubmissions } from "@/lib/db";
import { applyFilters, computeMetrics, distinctPlaces } from "@/lib/metrics";
import { isActivityType } from "@/lib/options";
import { requireAdmin } from "@/lib/auth";
import { EMPTY_FILTERS, type Filters as FilterValues } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

function dateOrEmpty(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function readFilters(search: Search): FilterValues {
  const aina = one(search.aina);
  return {
    kanda: one(search.kanda),
    mkoa: one(search.mkoa),
    halmashauri: one(search.halmashauri),
    aina: isActivityType(aina) ? aina : "",
    kuanzia: dateOrEmpty(one(search.kuanzia)),
    hadi: dateOrEmpty(one(search.hadi)),
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await requireAdmin();
  const filters = readFilters(await searchParams);
  const [all, samples] = await Promise.all([listSubmissions(), countSamples()]);
  const rows = applyFilters(all, filters);
  const metrics = computeMetrics(rows);
  const charts = buildChartSeries(rows);
  const places = distinctPlaces(all);
  const filtering =
    filters.kanda !== EMPTY_FILTERS.kanda ||
    filters.mkoa !== EMPTY_FILTERS.mkoa ||
    filters.halmashauri !== EMPTY_FILTERS.halmashauri ||
    filters.aina !== EMPTY_FILTERS.aina ||
    filters.kuanzia !== EMPTY_FILTERS.kuanzia ||
    filters.hadi !== EMPTY_FILTERS.hadi;

  return (
    <>
      <SiteHeader active="dashboard" adminName={session.name} />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Jumla zinafuata fomula za dashibodi ya Excel: idadi ya shughuli, na
          hesabu ya Me + Ke kwa upimaji na maambukizi.
        </p>
        {samples > 0 ? (
          <form action={clearSamples}>
            <Card className="bg-[#fff8ec] shadow-none ring-[#ead7b0]">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6">
                  {samples === 1
                    ? "Taarifa 1 ya sampuli iko kwenye hesabu."
                    : `Taarifa ${samples} za sampuli ziko kwenye hesabu.`}{" "}
                  Zina lebo Sampuli na zinaweza kufutwa bila kugusa taarifa nyingine.
                </p>
                <Button type="submit" variant="outline" className="w-full sm:w-auto">
                  <AppIcon icon={Delete02Icon} />
                  Futa taarifa za sampuli
                </Button>
              </CardContent>
            </Card>
          </form>
        ) : null}
        <Filters filters={filters} places={places} shown={rows.length} total={all.length} />
        <KpiGrid metrics={metrics} />
        <DashboardCharts series={charts} />
        <DailyTable rows={rows} empty={all.length === 0 || !filtering ? "none" : "filtered"} />
      </main>
    </>
  );
}
