"use server";

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { insertSubmission } from "@/lib/db";
import { findActiveFormLink } from "@/lib/form-links";
import { formDataToRecord, parseSubmission } from "@/lib/parse";
import { getLocale } from "@/lib/locale";
import { copy } from "@/lib/messages";
import { FORM_ACCESS_COOKIE, readFormAccess } from "@/lib/session";
import type { Submission } from "@/lib/types";

export type SubmitState =
  | null
  | { ok: false; errors: Record<string, string> }
  | { ok: true; saved: Submission };

export async function submitEntry(
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const locale = await getLocale();
  const t = copy[locale];
  const session = await getSession();
  const token = String(formData.get("formToken") ?? "");
  if (!session) {
    const link = await findActiveFormLink(token);
    if (!link) return { ok: false, errors: { form: t.form.deadLink } };
    if (link.passkey) {
      const jar = await cookies();
      const accessToken = await readFormAccess(jar.get(FORM_ACCESS_COOKIE)?.value);
      if (accessToken !== token) {
        return { ok: false, errors: { form: t.form.needPasskey } };
      }
    }
  }

  const parsed = parseSubmission(formDataToRecord(formData), locale);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const saved = await insertSubmission(parsed.value);
  return { ok: true, saved };
}
