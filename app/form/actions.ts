"use server";

import { revalidatePath } from "next/cache";
import { insertSubmission } from "@/lib/db";
import { formDataToRecord, parseSubmission } from "@/lib/parse";
import type { Submission } from "@/lib/types";

export type SubmitState =
  | null
  | { ok: false; errors: Record<string, string> }
  | { ok: true; saved: Submission };

export async function submitEntry(
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const parsed = parseSubmission(formDataToRecord(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const saved = await insertSubmission(parsed.value);
  revalidatePath("/");
  revalidatePath("/form");
  return { ok: true, saved };
}
