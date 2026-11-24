"use server";

import { revalidatePath } from "next/cache";
import { insertFormLink, revokeFormLink } from "@/lib/form-links";
import { requireSuperAdmin } from "@/lib/auth";
import { getCopy } from "@/lib/locale";

export type LinkFormState = { error?: string; ok?: string; token?: string; passkey?: string } | null;

function cleanLabel(value: FormDataEntryValue | null): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function cleanPasskey(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim().slice(0, 64);
}

export async function createFormLink(
  _previous: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const session = await requireSuperAdmin();
  const t = await getCopy();
  const passkey = cleanPasskey(formData.get("passkey"));
  if (passkey.length < 4) return { error: t.links.shortPasskey };
  const label = cleanLabel(formData.get("label")) || t.links.defaultLabel;
  const link = await insertFormLink({ label, createdBy: session.email, passkey });
  revalidatePath("/jaza");
  return { ok: t.links.created, token: link.token, passkey };
}

export async function stopFormLink(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await revokeFormLink(id);
  revalidatePath("/jaza");
}
