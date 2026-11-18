import {
  Activity02Icon,
  BookOpen01Icon,
  ClipboardIcon,
  HealthIcon,
  Medicine02Icon,
  Package01Icon,
  PercentIcon,
  TaskDone01Icon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AppIcon } from "@/components/app-icon";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount, formatPercent } from "@/lib/format";
import type { Metrics } from "@/lib/types";

const ITEMS: Array<{
  key: keyof Metrics;
  label: string;
  kind: "count" | "percent";
  icon: IconSvgElement;
}> = [
  { key: "planned", label: "Shughuli zilizopangwa", kind: "count", icon: ClipboardIcon },
  { key: "completed", label: "Shughuli zilizokamilika", kind: "count", icon: TaskDone01Icon },
  { key: "ongoing", label: "Shughuli zinazoendelea", kind: "count", icon: Activity02Icon },
  { key: "completionRatio", label: "Asilimia ya kukamilika", kind: "percent", icon: PercentIcon },
  { key: "tested", label: "Waliopima VVU", kind: "count", icon: TestTube01Icon },
  { key: "positive", label: "Waliokutwa na Maambukizi ya VVU", kind: "count", icon: HealthIcon },
  { key: "educated", label: "Waliofikiwa na Elimu", kind: "count", icon: BookOpen01Icon },
  { key: "condoms", label: "Kondomu zilizogawanywa", kind: "count", icon: Package01Icon },
  { key: "pep", label: "Dawa Kinga/PEP/PrEP zilizogawanywa", kind: "count", icon: Medicine02Icon },
];

export function KpiGrid({ metrics }: { metrics: Metrics }) {
  return (
    <section aria-labelledby="viashiria-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="viashiria-title" className="text-base font-medium">
          Viashiria
        </h2>
        <p className="text-sm text-muted-foreground">Hali ya utekelezaji</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ITEMS.map((item) => {
          const raw = metrics[item.key];
          const value =
            item.kind === "percent" ? formatPercent(Number(raw)) : formatCount(Number(raw));
          const width = Math.max(0, Math.min(100, Number(raw) * 100));
          return (
            <Card key={item.key} size="sm" className="shadow-none">
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-h-10 text-sm leading-5 font-medium text-muted-foreground">
                    {item.label}
                  </h3>
                  <span
                    className={
                      item.kind === "percent"
                        ? "grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary"
                        : "grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                    }
                  >
                    <AppIcon icon={item.icon} />
                  </span>
                </div>
                <p className="text-[28px] leading-8 font-medium tabular-nums">{value}</p>
                {item.kind === "percent" ? (
                  <div
                    className="h-2 overflow-hidden rounded bg-secondary"
                    role="img"
                    aria-label={`${value} ya shughuli zilizopangwa zimekamilika`}
                  >
                    <span className="block h-full rounded bg-primary" style={{ width: `${width}%` }} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
