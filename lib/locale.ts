import { cookies } from "next/headers";
import { copy, isLocale, LANG_COOKIE, type Copy, type Locale } from "@/lib/messages";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LANG_COOKIE)?.value;
  return isLocale(value) ? value : "sw";
}

export async function getCopy(): Promise<Copy> {
  return copy[await getLocale()];
}
