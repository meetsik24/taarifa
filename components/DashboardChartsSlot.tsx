"use client";

import dynamic from "next/dynamic";
import type { ChartSeries } from "@/lib/charts";

const DashboardCharts = dynamic(
  () => import("@/components/DashboardCharts").then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-xl bg-muted" />,
  },
);

export function DashboardChartsSlot({ series }: { series: ChartSeries }) {
  return <DashboardCharts series={series} />;
}
