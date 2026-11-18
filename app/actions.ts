"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteSamples } from "@/lib/db";

export async function clearSamples(): Promise<void> {
  await requireAdmin();
  await deleteSamples();
  revalidatePath("/");
}
