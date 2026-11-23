import Link from "next/link";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { clearSamples } from "@/app/actions";
import { AppIcon } from "@/components/app-icon";
import { DashboardChartsSlot } from "@/components/DashboardChartsSlot";
import { DailyTable } from "@/components/DailyTable";
import { ExportBar } from "@/components/ExportBar";
import { Filters } from "@/components/Filters";
import { KpiGrid } from "@/components/KpiGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildChartSeries } from "@/lib/charts";
import { listSubmissions } from "@/lib/db";
import { applyFilters, computeMetrics } from "@/lib/metrics";
import { getCopy } from "@/lib/locale";
import { fill } from "@/lib/messages";
import { EMPTY_FILTERS, type Filters as FilterValues } from "@/lib/types";

export function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export async function ReportView({
  filters,
  path,
  view,
}: {
  filters: FilterValues;
  path: string;
  view: "kpis" | "charts" | "table";
}) {
  let all: Awaited<ReturnType<typeof listSubmissions>> = [];
  let loadFailed = false;
  try {
    all = await listSubmissions();
  } catch (error) {
    console.error(error);
    loadFailed = true;
  }
  const t = await getCopy();
  if (loadFailed) {
    return (
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6">{t.loadError.body}</p>
          <Link href={path} className="text-sm font-medium text-primary">
            {t.loadError.retry}
          </Link>
        </CardContent>
      </Card>
    );
  }

  const rows = applyFilters(all, filters);
  const metrics = computeMetrics(rows);
  const charts = buildChartSeries(rows);
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
          <Card className="bg-accent shadow-none">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6">
                {samples === 1 ? t.samples.one : fill(t.samples.many, { count: samples })} {t.samples.note}
              </p>
              <Button type="submit" variant="outline" className="w-full sm:w-auto">
                <AppIcon icon={Delete02Icon} />
                {t.samples.clear}
              </Button>
            </CardContent>
          </Card>
        </form>
      ) : null}
      <ExportBar rows={rows} metrics={metrics} charts={charts} filters={filters} />
      <Filters filters={filters} shown={rows.length} total={all.length} path={path} />
      {view === "kpis" ? <KpiGrid metrics={metrics} /> : null}
      {view === "charts" ? <DashboardChartsSlot series={charts} /> : null}
      {view === "table" ? (
        <DailyTable rows={rows} empty={all.length === 0 || !filtering ? "none" : "filtered"} />
      ) : null}
    </>
  );
}
