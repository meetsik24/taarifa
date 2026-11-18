import type { ActivityType, Status } from "./options";

export type Submission = {
  id: number;
  createdAt: string;
  tarehe: string;
  kanda: string;
  mkoa: string;
  halmashauri: string;
  shughuli: string;
  aina: ActivityType;
  eneo: string;
  mdau: string;
  hali: Status;
  vvuMe: number;
  vvuKe: number;
  maambukiziMe: number;
  maambukiziKe: number;
  waliounganishwa: number;
  elimu: number;
  kondomu: number;
  pep: number;
  jipime: number;
  ushahidi: string;
  sample: boolean;
};

export type NewSubmission = Omit<Submission, "id" | "createdAt">;

export type Filters = {
  kanda: string;
  mkoa: string;
  halmashauri: string;
  aina: string;
  kuanzia: string;
  hadi: string;
};

export type Metrics = {
  planned: number;
  completed: number;
  ongoing: number;
  /** Completed / planned. 0 when nothing is planned (Excel IFERROR). */
  completionRatio: number;
  tested: number;
  positive: number;
  educated: number;
  condoms: number;
  pep: number;
  rows: number;
};

export const EMPTY_FILTERS: Filters = {
  kanda: "",
  mkoa: "",
  halmashauri: "",
  aina: "",
  kuanzia: "",
  hadi: "",
};
