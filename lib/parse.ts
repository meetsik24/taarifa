import { copy, fill, type Locale } from "./messages";
import { activityTypesIn, isActivityType, isStatus, joinActivityTypes } from "./options";
import { isHalmashauriOf, isKanda, isMkoaOf } from "./places";
import type { NewSubmission } from "./types";

type Phrases = (typeof copy)["sw"]["validation"];

export type ParseResult =
  | { ok: true; value: NewSubmission }
  | { ok: false; errors: Record<string, string> };

function text(input: Record<string, string>, key: string): string {
  return (input[key] ?? "").trim();
}

function required(
  input: Record<string, string>,
  key: string,
  label: string,
  errors: Record<string, string>,
  phrases: Phrases,
  max = 200,
): string {
  const value = text(input, key);
  if (!value) errors[key] = fill(phrases.required, { label });
  else if (value.length > max) errors[key] = fill(phrases.tooLong, { label });
  return value;
}

function optional(
  input: Record<string, string>,
  key: string,
  label: string,
  errors: Record<string, string>,
  phrases: Phrases,
  max = 400,
): string {
  const value = text(input, key);
  if (value.length > max) errors[key] = fill(phrases.tooLong, { label });
  return value;
}

function count(
  input: Record<string, string>,
  key: string,
  errors: Record<string, string>,
  phrases: Phrases,
): number {
  const raw = text(input, key);
  if (!raw) return 0;
  if (!/^\d+$/.test(raw)) {
    errors[key] = phrases.wholeNumber;
    return 0;
  }
  const value = Number(raw);
  if (value > 1_000_000_000) {
    errors[key] = phrases.numberTooBig;
    return 0;
  }
  return value;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function todayInTanzania(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Dar_es_Salaam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseSubmission(input: Record<string, string>, locale: Locale = "sw"): ParseResult {
  const t = copy[locale];
  const phrases = t.validation;
  const label = t.fields;
  const errors: Record<string, string> = {};
  const tarehe = required(input, "tarehe", label.date, errors, phrases);
  if (tarehe && !isIsoDate(tarehe)) errors.tarehe = phrases.badDate;
  else if (tarehe && tarehe !== todayInTanzania()) errors.tarehe = phrases.todayOnly;

  const kanda = required(input, "kanda", label.zone, errors, phrases);
  if (kanda && !isKanda(kanda)) errors.kanda = phrases.badZone;
  const mkoa = required(input, "mkoa", label.region, errors, phrases);
  if (mkoa && kanda && isKanda(kanda) && !isMkoaOf(kanda, mkoa)) {
    errors.mkoa = phrases.badRegion;
  }
  const halmashauri = required(input, "halmashauri", label.council, errors, phrases);
  if (halmashauri && mkoa && isMkoaOf(kanda, mkoa) && !isHalmashauriOf(mkoa, halmashauri)) {
    errors.halmashauri = phrases.badCouncil;
  }
  const shughuli = required(input, "shughuli", label.activity, errors, phrases, 300);
  const submittedTypes = text(input, "aina")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const types = activityTypesIn(text(input, "aina"));
  if (submittedTypes.length === 0) errors.aina = fill(phrases.required, { label: label.activityType });
  else if (submittedTypes.some((part) => !isActivityType(part))) errors.aina = phrases.badActivity;
  const aina = joinActivityTypes(types);
  const otherSelected = types.includes("Huduma nyingine");
  const nyingine = otherSelected ? optional(input, "nyingine", label.otherActivity, errors, phrases, 300) : "";
  if (otherSelected && !nyingine) errors.nyingine = fill(phrases.required, { label: label.otherActivity });
  const hali = required(input, "hali", label.status, errors, phrases);
  if (hali && !isStatus(hali)) errors.hali = phrases.badStatus;

  const eneo = optional(input, "eneo", label.area, errors, phrases);
  const mdau = optional(input, "mdau", label.actor, errors, phrases);
  const ushahidi = optional(input, "ushahidi", label.evidence, errors, phrases);

  const vvuMe = count(input, "vvuMe", errors, phrases);
  const vvuKe = count(input, "vvuKe", errors, phrases);
  const maambukiziMe = count(input, "maambukiziMe", errors, phrases);
  const maambukiziKe = count(input, "maambukiziKe", errors, phrases);
  const waliounganishwa = count(input, "waliounganishwa", errors, phrases);
  const elimu = count(input, "elimu", errors, phrases);
  const kondomu = count(input, "kondomu", errors, phrases);
  const pep = count(input, "pep", errors, phrases);
  const jipime = count(input, "jipime", errors, phrases);
  const tested = vvuMe + vvuKe;
  const positives = maambukiziMe + maambukiziKe;
  const outcomes = {
    vvuMe,
    vvuKe,
    maambukiziMe,
    maambukiziKe,
    waliounganishwa,
    elimu,
    kondomu,
    pep,
    jipime,
  };

  if (hali === "Haijaanza" || hali === "Imesitishwa") {
    for (const [key, value] of Object.entries(outcomes)) {
      if (value > 0) errors[key] = phrases.zeroWhenInactive;
    }
  }
  if (maambukiziMe > vvuMe) errors.maambukiziMe = phrases.maleInfections;
  if (maambukiziKe > vvuKe) errors.maambukiziKe = phrases.femaleInfections;
  if (tested > 0 && waliounganishwa > positives) {
    errors.waliounganishwa = phrases.linkedTooHigh;
  }
  const educationOnly = types.length > 0 && types.every((type) => type === "Elimu na uhamasishaji");
  if (educationOnly && (tested > 0 || positives > 0)) {
    errors.vvuMe = phrases.educationNoTesting;
  }
  if (hali === "Imekamilika" && types.includes("Upimaji wa VVU") && tested === 0) {
    errors.vvuMe = phrases.testingNeedsCount;
  }
  if (hali === "Imekamilika" && types.includes("Elimu na uhamasishaji") && elimu === 0) {
    errors.elimu = phrases.educationNeedsCount;
  }
  if (hali === "Imekamilika" && types.includes("Rufaa na uunganishaji") && waliounganishwa === 0) {
    errors.waliounganishwa = phrases.referralNeedsCount;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      tarehe,
      kanda,
      mkoa,
      halmashauri,
      shughuli,
      aina,
      nyingine,
      eneo,
      mdau,
      hali: hali as NewSubmission["hali"],
      vvuMe,
      vvuKe,
      maambukiziMe,
      maambukiziKe,
      waliounganishwa,
      elimu,
      kondomu,
      pep,
      jipime,
      ushahidi,
      sample: text(input, "sample") === "1",
    },
  };
}

export function formDataToRecord(formData: FormData): Record<string, string> {
  const record: Record<string, string> = {};
  const activities: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (key === "aina") {
      activities.push(value);
      continue;
    }
    record[key] = value;
  }
  if (activities.length > 0) record.aina = joinActivityTypes(activities);
  return record;
}
