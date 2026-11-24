"use client";

import { useEffect, useState } from "react";
import { FilterIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { useCopy, useLocale } from "@/components/language-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "cn";
import { fill, translateTerm } from "@/lib/messages";
import { ACTIVITY_TYPES } from "@/lib/options";
import { alignPlaceFilters, councilsForSelection, KANDA, regionsForZone } from "@/lib/places";
import type { Filters } from "@/lib/types";

const dateClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10";

export function Filters({
  filters,
  zoneLock = "",
  shown,
  total,
  path = "/",
}: {
  filters: Filters;
  zoneLock?: string;
  shown: number;
  total: number;
  path?: string;
}) {
  const t = useCopy();
  const locale = useLocale();
  const [kanda, setKanda] = useState(filters.kanda);
  const [mkoa, setMkoa] = useState(filters.mkoa);
  const [halmashauri, setHalmashauri] = useState(filters.halmashauri);
  const regions = regionsForZone(kanda);
  const councils = councilsForSelection(kanda, mkoa);

  useEffect(() => {
    setKanda(filters.kanda);
    setMkoa(filters.mkoa);
    setHalmashauri(filters.halmashauri);
  }, [filters.kanda, filters.mkoa, filters.halmashauri]);

  function chooseZone(next: string): void {
    const aligned = alignPlaceFilters(next, mkoa, halmashauri);
    setKanda(aligned.kanda);
    setMkoa(aligned.mkoa);
    setHalmashauri(aligned.halmashauri);
  }

  function chooseRegion(next: string): void {
    const aligned = alignPlaceFilters(kanda, next, halmashauri);
    setMkoa(aligned.mkoa);
    setHalmashauri(aligned.halmashauri);
  }

  function chooseCouncil(next: string): void {
    setHalmashauri(alignPlaceFilters(kanda, mkoa, next).halmashauri);
  }

  return (
    <Card className="shadow-none">
      <form method="get" action={path}>
        <CardHeader>
          <CardTitle>{t.filters.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {fill(t.filters.showing, { shown, total })}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kanda">{t.fields.zone}</Label>
              <NativeSelect
                id="kanda"
                name="kanda"
                value={zoneLock || kanda}
                onChange={(event) => chooseZone(event.target.value)}
                disabled={Boolean(zoneLock)}
              >
                {zoneLock ? null : <option value="">{t.words.all}</option>}
                {(zoneLock ? [zoneLock] : KANDA).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
              {zoneLock ? <input type="hidden" name="kanda" value={zoneLock} /> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mkoa">{t.fields.region}</Label>
              <NativeSelect
                id="mkoa"
                name="mkoa"
                value={mkoa}
                onChange={(event) => chooseRegion(event.target.value)}
              >
                <option value="">{t.words.all}</option>
                {regions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="halmashauri">{t.fields.council}</Label>
              <NativeSelect
                id="halmashauri"
                name="halmashauri"
                value={halmashauri}
                onChange={(event) => chooseCouncil(event.target.value)}
              >
                <option value="">{t.words.all}</option>
                {councils.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aina">{t.fields.activityType}</Label>
              <NativeSelect id="aina" name="aina" defaultValue={filters.aina}>
                <option value="">{t.words.all}</option>
                {ACTIVITY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {translateTerm(locale, value)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kuanzia">{t.filters.weekStart}</Label>
              <input
                id="kuanzia"
                name="kuanzia"
                type="date"
                defaultValue={filters.kuanzia}
                className={dateClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hadi">{t.filters.endDate}</Label>
              <input id="hadi" name="hadi" type="date" defaultValue={filters.hadi} className={dateClass} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" className="w-full sm:w-auto">
              <AppIcon icon={FilterIcon} />
              {t.filters.apply}
            </Button>
            <Link href={path} className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
              {t.filters.clear}
            </Link>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
