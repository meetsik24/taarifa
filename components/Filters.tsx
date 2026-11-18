import { FilterIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "cn";
import { ACTIVITY_TYPES } from "@/lib/options";
import type { Filters } from "@/lib/types";

function withCurrent(options: string[], current: string): string[] {
  if (current && !options.includes(current)) return [current, ...options];
  return options;
}

const dateClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10";

export function Filters({
  filters,
  places,
  shown,
  total,
}: {
  filters: Filters;
  places: { kanda: string[]; mkoa: string[]; halmashauri: string[] };
  shown: number;
  total: number;
}) {
  return (
    <Card className="shadow-none">
      <form method="get" action="/">
        <CardHeader>
          <CardTitle>Vichujio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Inaonyesha {shown} kati ya {total} taarifa.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kanda">Kanda</Label>
              <NativeSelect id="kanda" name="kanda" defaultValue={filters.kanda}>
                <option value="">Zote</option>
                {withCurrent(places.kanda, filters.kanda).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mkoa">Mkoa</Label>
              <NativeSelect id="mkoa" name="mkoa" defaultValue={filters.mkoa}>
                <option value="">Zote</option>
                {withCurrent(places.mkoa, filters.mkoa).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="halmashauri">Halmashauri</Label>
              <NativeSelect id="halmashauri" name="halmashauri" defaultValue={filters.halmashauri}>
                <option value="">Zote</option>
                {withCurrent(places.halmashauri, filters.halmashauri).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aina">Aina ya shughuli</Label>
              <NativeSelect id="aina" name="aina" defaultValue={filters.aina}>
                <option value="">Zote</option>
                {ACTIVITY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kuanzia">Tarehe ya kuanza wiki</Label>
              <input
                id="kuanzia"
                name="kuanzia"
                type="date"
                defaultValue={filters.kuanzia}
                className={dateClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hadi">Tarehe ya mwisho</Label>
              <input
                id="hadi"
                name="hadi"
                type="date"
                defaultValue={filters.hadi}
                className={dateClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" className="w-full sm:w-auto">
              <AppIcon icon={FilterIcon} />
              Chuja
            </Button>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
              Ondoa vichujio
            </Link>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
