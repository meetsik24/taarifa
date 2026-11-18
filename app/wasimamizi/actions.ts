"use server";

import { revalidatePath } from "next/cache";
import { countAdmins, deleteAdmin, findAdminByEmail, insertAdmin } from "@/lib/admins";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export type AdminFormState = { error?: string; ok?: string } | null;

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function createAdmin(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (name.length < 2 || name.length > 80) return { error: "Jina liwe kati ya herufi 2 na 80." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Barua pepe si sahihi." };
  if (password.length < 8) return { error: "Nenosiri liwe na herufi 8 au zaidi." };
  if (password !== confirm) return { error: "Nenosiri halilingani." };
  if (await findAdminByEmail(email)) return { error: "Barua pepe hii tayari imesajiliwa." };

  await insertAdmin({ name, email, passwordHash: await hashPassword(password) });
  revalidatePath("/wasimamizi");
  return { ok: `${name} ameongezwa.` };
}

export async function removeAdmin(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const total = await countAdmins();
  if (total <= 1) return;
  const admins = await findAdminByEmail(session.email);
  if (admins?.id === id) return;
  await deleteAdmin(id);
  revalidatePath("/wasimamizi");
}
