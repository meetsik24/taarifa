"use client";

import { useState } from "react";
import { Pdf01Icon, Xls01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { Button } from "@/components/ui/button";
import type { ChartSeries } from "@/lib/charts";
import type { Filters, Metrics, Submission } from "@/lib/types";

export function ExportBar({
  rows,
  metrics,
  charts,
  filters,
}: {
  rows: Submission[];
  metrics: Metrics;
  charts: ChartSeries;
  filters: Filters;
}) {
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState("");

  async function run(kind: "pdf" | "excel") {
    setBusy(kind);
    setError("");
    try {
      if (kind === "excel") {
        const { downloadExcel } = await import("@/lib/export-excel");
        await downloadExcel({ rows, metrics, charts, filters });
      } else {
        const { downloadPdf } = await import("@/lib/export-pdf");
        downloadPdf({ rows, metrics, charts, filters });
      }
    } catch (cause) {
      console.error(cause);
      setError("Imeshindikana kupakua. Jaribu tena.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Pakua taarifa zinazoonekana sasa. PDF ina viashiria, chati, na jedwali lote.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => run("excel")}
        >
          <AppIcon icon={Xls01Icon} />
          {busy === "excel" ? "Inatayarisha…" : "Pakua Excel"}
        </Button>
        <Button type="button" disabled={busy !== null} onClick={() => run("pdf")}>
          <AppIcon icon={Pdf01Icon} />
          {busy === "pdf" ? "Inatayarisha…" : "Pakua PDF"}
        </Button>
      </div>
    </div>
  );
}
