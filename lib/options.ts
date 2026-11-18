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

export function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}
