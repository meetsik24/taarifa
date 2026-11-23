import { isActivityType } from "@/lib/options";
import { alignPlaceFilters } from "@/lib/places";
import type { Filters } from "@/lib/types";

export type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

function dateOrEmpty(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export function readFilters(search: Search): Filters {
  const aina = one(search.aina);
  const place = alignPlaceFilters(one(search.kanda), one(search.mkoa), one(search.halmashauri));
  return {
    ...place,
    aina: isActivityType(aina) ? aina : "",
    kuanzia: dateOrEmpty(one(search.kuanzia)),
    hadi: dateOrEmpty(one(search.hadi)),
  };
}
