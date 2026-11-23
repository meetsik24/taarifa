"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { deleteSamples } from "@/lib/db";

export async function clearSamples(): Promise<void> {
  await requireStaff();
  await deleteSamples();
  revalidatePath("/");
  revalidatePath("/michoro");
  revalidatePath("/matokeo");
}
