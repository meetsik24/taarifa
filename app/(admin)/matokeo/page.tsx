import { Suspense } from "react";
import type { Metadata } from "next";
import { ReportSkeleton, ReportView } from "@/components/report-view";
import { getCopy } from "@/lib/locale";
import { readFilters, type Search } from "@/lib/read-filters";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return { title: t.titles.results };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const filters = readFilters(await searchParams);
  const t = await getCopy();

  return (
    <>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{t.pages.resultsLead}</p>
      <Suspense fallback={<ReportSkeleton />}>
        <ReportView filters={filters} path="/matokeo" view="table" />
      </Suspense>
    </>
  );
}
