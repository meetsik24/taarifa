"use server";

import { redirect } from "next/navigation";
import { endSession, safeNextPath, startSession } from "@/lib/auth";

export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  let ok = false;
  try {
    ok = await startSession(email, password);
  } catch (error) {
    console.error(error);
    redirect(`/ingia?e=2&next=${encodeURIComponent(next)}`);
  }
  if (!ok) redirect(`/ingia?e=1&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/ingia");
}
