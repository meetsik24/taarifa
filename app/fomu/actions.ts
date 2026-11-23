"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isFormToken, passkeyMatches } from "@/lib/form-links";
import { getCopy } from "@/lib/locale";
import { FORM_ACCESS_COOKIE, signFormAccess } from "@/lib/session";

export type UnlockState = { error?: string } | null;

export async function unlockSharedForm(
  _previous: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const t = await getCopy();
  const token = String(formData.get("token") ?? "");
  if (!isFormToken(token)) return { error: t.passkey.badLink };

  const passkey = String(formData.get("passkey") ?? "");
  const matches = await passkeyMatches(token, passkey);
  if (!matches) return { error: t.passkey.badPasskey };

  const jar = await cookies();
  jar.set(FORM_ACCESS_COOKIE, await signFormAccess(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(`/fomu/${token}`);
}
