/** Lists from data-validation on sheet "Ufuatiliaji wa Kila Siku". */

export const ACTIVITY_TYPES = [
  "Upimaji wa VVU",
  "Elimu na uhamasishaji",
  "Rufaa na uunganishaji",
  "Mawasiliano",
  "Uratibu na taarifa",
  "Huduma nyingine",
] as const;

export const STATUSES = [
  "Haijaanza",
  "Inaendelea",
  "Imekamilika",
  "Imesitishwa",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type Status = (typeof STATUSES)[number];

export const ACTIVITY_JOIN = " | ";

export function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}

export function activityTypesIn(value: string): ActivityType[] {
  const seen = new Set<string>();
  const types: ActivityType[] = [];
  for (const part of value.split("|")) {
    const item = part.trim();
    if (!isActivityType(item) || seen.has(item)) continue;
    seen.add(item);
    types.push(item);
  }
  return types;
}

export function joinActivityTypes(values: readonly string[]): string {
  return ACTIVITY_TYPES.filter((type) => values.includes(type)).join(ACTIVITY_JOIN);
}

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}
