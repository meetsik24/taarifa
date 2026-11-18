"use server";

import { revalidatePath } from "next/cache";
import { insertFormLink, revokeFormLink } from "@/lib/form-links";
import { requireAdmin } from "@/lib/auth";

export type LinkFormState = { error?: string; ok?: string; token?: string } | null;

function cleanLabel(value: FormDataEntryValue | null): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function createFormLink(
  _previous: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const session = await requireAdmin();
  const label = cleanLabel(formData.get("label")) || "Fomu ya taarifa";
  const link = await insertFormLink({ label, createdBy: session.email });
  revalidatePath("/jaza");
  return { ok: "Kiungo kimetengenezwa. Nakili au shiriki.", token: link.token };
}

export async function stopFormLink(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await revokeFormLink(id);
  revalidatePath("/jaza");
}
