"use server";

import { revalidatePath } from "next/cache";
import { deleteAdmin, findAdminByEmail, insertAdmin } from "@/lib/admins";
import { requireSuperAdmin } from "@/lib/auth";
import { getCopy } from "@/lib/locale";
import { fill } from "@/lib/messages";
import { hashPassword } from "@/lib/password";
import type { Role } from "@/lib/roles";

export type AdminFormState = { error?: string; ok?: string } | null;

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function createAdmin(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireSuperAdmin();
  const t = await getCopy();
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const role: Exclude<Role, "super_admin"> = clean(formData.get("role")) === "filler" ? "filler" : "admin";

  if (name.length < 2 || name.length > 80) return { error: t.admins.nameLength };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: t.admins.badEmail };
  if (password.length < 8) return { error: t.admins.shortPassword };
  if (password !== confirm) return { error: t.admins.passwordMismatch };
  if (await findAdminByEmail(email)) return { error: t.admins.emailTaken };

  await insertAdmin({ name, email, passwordHash: await hashPassword(password), role });
  revalidatePath("/wasimamizi");
  return { ok: fill(t.admins.added, { name }) };
}

export async function removeAdmin(formData: FormData): Promise<void> {
  const session = await requireSuperAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const current = await findAdminByEmail(session.email);
  if (!current || current.id === id) return;
  await deleteAdmin(id);
  revalidatePath("/wasimamizi");
}
