import { isActivityType, isStatus } from "./options";
import { isHalmashauriOf, isKanda, isMkoaOf } from "./places";
import type { NewSubmission } from "./types";

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
  max = 200,
): string {
  const value = text(input, key);
  if (!value) errors[key] = `${label} inahitajika.`;
  else if (value.length > max) errors[key] = `${label} ni ndefu mno.`;
  return value;
}

function optional(
  input: Record<string, string>,
  key: string,
  label: string,
  errors: Record<string, string>,
  max = 400,
): string {
  const value = text(input, key);
  if (value.length > max) errors[key] = `${label} ni ndefu mno.`;
  return value;
}

function count(
  input: Record<string, string>,
  key: string,
  errors: Record<string, string>,
): number {
  const raw = text(input, key);
  if (!raw) return 0;
  if (!/^\d+$/.test(raw)) {
    errors[key] = "Weka namba kamili (0 au zaidi).";
    return 0;
  }
  const value = Number(raw);
  if (value > 1_000_000_000) {
    errors[key] = "Namba ni kubwa mno.";
    return 0;
  }
  return value;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseSubmission(input: Record<string, string>): ParseResult {
  const errors: Record<string, string> = {};
  const tarehe = required(input, "tarehe", "Tarehe", errors);
  if (tarehe && !isIsoDate(tarehe)) errors.tarehe = "Tarehe si sahihi.";

  const kanda = required(input, "kanda", "Kanda", errors);
  if (kanda && !isKanda(kanda)) errors.kanda = "Chagua kanda kutoka kwenye orodha.";
  const mkoa = required(input, "mkoa", "Mkoa", errors);
  if (mkoa && kanda && isKanda(kanda) && !isMkoaOf(kanda, mkoa)) {
    errors.mkoa = "Chagua mkoa wa kanda hii.";
  }
  const halmashauri = required(input, "halmashauri", "Halmashauri", errors);
  if (halmashauri && mkoa && isMkoaOf(kanda, mkoa) && !isHalmashauriOf(mkoa, halmashauri)) {
    errors.halmashauri = "Chagua halmashauri ya mkoa huu.";
  }
  const shughuli = required(input, "shughuli", "Shughuli iliyopangwa", errors, 300);
  const aina = required(input, "aina", "Aina ya shughuli", errors);
  if (aina && !isActivityType(aina)) errors.aina = "Chagua aina ya shughuli kutoka kwenye orodha.";
  const hali = required(input, "hali", "Hali ya utekelezaji", errors);
  if (hali && !isStatus(hali)) errors.hali = "Chagua hali ya utekelezaji kutoka kwenye orodha.";

  const eneo = optional(input, "eneo", "Eneo / kundi lengwa", errors);
  const mdau = optional(input, "mdau", "Mhusika / mdau", errors);
  const ushahidi = optional(input, "ushahidi", "Ushahidi / rejea", errors);

  const vvuMe = count(input, "vvuMe", errors);
  const vvuKe = count(input, "vvuKe", errors);
  const maambukiziMe = count(input, "maambukiziMe", errors);
  const maambukiziKe = count(input, "maambukiziKe", errors);
  const waliounganishwa = count(input, "waliounganishwa", errors);
  const elimu = count(input, "elimu", errors);
  const kondomu = count(input, "kondomu", errors);
  const pep = count(input, "pep", errors);
  const jipime = count(input, "jipime", errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      tarehe,
      kanda,
      mkoa,
      halmashauri,
      shughuli,
      aina: aina as NewSubmission["aina"],
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
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}
