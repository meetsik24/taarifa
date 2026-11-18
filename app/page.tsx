import { Suspense } from "react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { clearSamples } from "@/app/actions";
import { AppIcon } from "@/components/app-icon";
import { DashboardChartsSlot } from "@/components/DashboardChartsSlot";
import { ExportBar } from "@/components/ExportBar";
import { DailyTable } from "@/components/DailyTable";
import { Filters } from "@/components/Filters";
import { KpiGrid } from "@/components/KpiGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildChartSeries } from "@/lib/charts";
import { listSubmissions } from "@/lib/db";
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

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

async function DashboardData({ filters }: { filters: FilterValues }) {
  let all: Awaited<ReturnType<typeof listSubmissions>> = [];
  let loadFailed = false;
  try {
    all = await listSubmissions();
  } catch (error) {
    console.error(error);
    loadFailed = true;
  }
  if (loadFailed) {
    return (
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6">
            Umeingia, lakini taarifa hazikupatikana kwa sasa. Jaribu tena.
          </p>
          <a href="/" className="text-sm font-medium text-primary">
            Pakia upya
          </a>
        </CardContent>
      </Card>
    );
  }

  const rows = applyFilters(all, filters);
  const metrics = computeMetrics(rows);
  const charts = buildChartSeries(rows);
  const places = distinctPlaces(all);
  const samples = all.reduce((count, row) => count + (row.sample ? 1 : 0), 0);
  const filtering =
    filters.kanda !== EMPTY_FILTERS.kanda ||
    filters.mkoa !== EMPTY_FILTERS.mkoa ||
    filters.halmashauri !== EMPTY_FILTERS.halmashauri ||
    filters.aina !== EMPTY_FILTERS.aina ||
    filters.kuanzia !== EMPTY_FILTERS.kuanzia ||
    filters.hadi !== EMPTY_FILTERS.hadi;

  return (
    <>
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
      <ExportBar rows={rows} metrics={metrics} charts={charts} filters={filters} />
      <Filters filters={filters} places={places} shown={rows.length} total={all.length} />
      <KpiGrid metrics={metrics} />
      <DashboardChartsSlot series={charts} />
      <DailyTable rows={rows} empty={all.length === 0 || !filtering ? "none" : "filtered"} />
    </>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await requireAdmin();
  const filters = readFilters(await searchParams);

  return (
    <>
      <SiteHeader active="dashboard" adminName={session.name} />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Jumla zinafuata fomula za dashibodi ya Excel: idadi ya shughuli, na
          hesabu ya Me + Ke kwa upimaji na maambukizi.
        </p>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardData filters={filters} />
        </Suspense>
      </main>
    </>
  );
}
