"use client";

import { useState } from "react";
import { Pdf01Icon, Xls01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { useLocale, useCopy } from "@/components/language-provider";
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
  const locale = useLocale();
  const t = useCopy();
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState("");

  async function run(kind: "pdf" | "excel") {
    setBusy(kind);
    setError("");
    try {
      if (kind === "excel") {
        const { downloadExcel } = await import("@/lib/export-excel");
        await downloadExcel({ rows, metrics, charts, filters, locale });
      } else {
        const { downloadPdf } = await import("@/lib/export-pdf");
        await downloadPdf({ rows, metrics, charts, filters, locale });
      }
    } catch (cause) {
      console.error(cause);
      setError(t.export.failed);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{t.export.hint}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => run("excel")}
        >
          <AppIcon icon={Xls01Icon} />
          {busy === "excel" ? t.export.preparing : t.export.excel}
        </Button>
        <Button type="button" disabled={busy !== null} onClick={() => run("pdf")}>
          <AppIcon icon={Pdf01Icon} />
          {busy === "pdf" ? t.export.preparing : t.export.pdf}
        </Button>
      </div>
    </div>
  );
}
