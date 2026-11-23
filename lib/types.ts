import type { Status } from "./options";

export type Submission = {
  id: number;
  createdAt: string;
  tarehe: string;
  kanda: string;
  mkoa: string;
  halmashauri: string;
  shughuli: string;
  aina: string;
  /** What the person wrote when they ticked Huduma nyingine. Empty otherwise. */
  nyingine: string;
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
  selfTests: number;
  linked: number;
  /** Positive / tested. 0 when nobody was tested. */
  positivity: number;
  /** Linked to care / positive. 0 when nobody was positive. */
  linkageRatio: number;
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
