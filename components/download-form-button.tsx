"use client";

import { useState } from "react";
import { Pdf01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { useCopy, useLocale } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import type { Submission } from "@/lib/types";

export function DownloadFormButton({ row }: { row: Submission }) {
  const t = useCopy();
  const locale = useLocale();
  const [busy, setBusy] = useState(false);

  async function download(): Promise<void> {
    setBusy(true);
    try {
      const { downloadFormPdf } = await import("@/lib/export-pdf");
      await downloadFormPdf(row, locale);
    } catch (cause) {
      console.error(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void download()}>
      <AppIcon icon={Pdf01Icon} />
      {busy ? t.export.preparing : t.table.download}
    </Button>
  );
}
